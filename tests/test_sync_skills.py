"""Exercise link synchronization only in temporary directories."""
import contextlib
import importlib.util
import io
from pathlib import Path
import os
import re
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("sync_skills", ROOT / "scripts/sync_skills.py")
sync_skills = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync_skills)


class SyncSkillsTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.collections = self.root / "source with spaces"
        self.target = self.root / "home with spaces/.agents/skills"

    def skill(self, name, group="frontend"):
        folder = self.collections / group / name
        folder.mkdir(parents=True)
        (folder / "SKILL.md").write_text(f"---\nname: {name}\ndescription: Test\n---\nBody\n")
        (folder / "asset.txt").write_text("original")
        return folder

    def sync(self, **kwargs):
        with contextlib.redirect_stdout(io.StringIO()):
            return sync_skills.sync(self.collections, self.target, **kwargs)

    def test_links_are_live_and_future_skills_are_added(self):
        source = self.skill("first")
        self.assertEqual(self.sync(), {"linked": 1, "managed": 0, "skipped": 0})
        self.assertTrue((self.target / "first").is_symlink())
        (source / "asset.txt").write_text("updated")
        self.assertEqual((self.target / "first/asset.txt").read_text(), "updated")
        self.skill("second", "series/nested")
        self.assertEqual(self.sync(), {"linked": 1, "managed": 1, "skipped": 0})
        self.assertEqual(self.sync(), {"linked": 0, "managed": 2, "skipped": 0})

    def test_existing_content_and_links_are_preserved(self):
        self.target.mkdir(parents=True)
        for name in ("directory", "file", "external", "dangling"):
            self.skill(name)
        (self.target / "directory").mkdir()
        (self.target / "directory/local.txt").write_text("local edits")
        (self.target / "file").write_text("user file")
        outside = self.root / "outside"
        outside.mkdir()
        (self.target / "external").symlink_to(outside)
        (self.target / "dangling").symlink_to(self.root / "missing")
        self.assertEqual(self.sync()["skipped"], 4)
        self.assertEqual((self.target / "directory/local.txt").read_text(), "local edits")
        self.assertEqual((self.target / "file").read_text(), "user file")
        self.assertEqual((self.target / "external").readlink(), outside)
        self.assertEqual((self.target / "dangling").readlink(), self.root / "missing")
        self.assertFalse((self.root / "missing").exists())

    def test_dry_run_does_not_create_target(self):
        self.skill("first")
        self.assertEqual(self.sync(dry_run=True)["linked"], 1)
        self.assertFalse(self.target.exists())

    def test_duplicate_names_fail_before_writing(self):
        self.skill("duplicate", "one")
        self.skill("duplicate", "two")
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            self.sync()
        self.assertFalse(self.target.exists())

    def test_invalid_name_fails_before_writing(self):
        source = self.skill("valid")
        (source / "SKILL.md").write_text("---\nname: ../escape\n---\nBody")
        with self.assertRaisesRegex(ValueError, "Invalid"):
            self.sync()
        self.assertFalse(self.target.exists())

    def test_bilingual_commands_in_temporary_home(self):
        snippets = []
        for document in ("doc/usage/quickstart.md", "doc/zh/quickstart.zh-CN.md"):
            text = (ROOT / document).read_text(encoding="utf-8")
            match = re.search(r"<!-- sync:skills -->\s*```bash\n(.*?)```", text, re.S)
            self.assertIsNotNone(match)
            snippets.append(match.group(1))
        self.assertEqual(*snippets)
        work = self.root / "repository"
        (work / "scripts").mkdir(parents=True)
        shutil.copy2(ROOT / "scripts/sync_skills.py", work / "scripts/sync_skills.py")
        self.collections = work / "collections"
        self.skill("example")
        home = self.root / "temporary home"
        env = {**os.environ, "HOME": str(home), "BASH_ENV": "/dev/null"}
        for command in snippets[0].strip().splitlines():
            result = subprocess.run(["bash", "--noprofile", "--norc", "-c", command],
                                    cwd=work, env=env, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            if "--dry-run" in command:
                self.assertFalse(home.exists())
        self.assertTrue((home / ".agents/skills/example/SKILL.md").is_file())

    def test_real_catalog_can_be_linked_in_isolation(self):
        self.collections = ROOT / "collections"
        result = self.sync()
        self.assertGreater(result["linked"], 0)
        for name, source in sync_skills.discover(self.collections).items():
            self.assertEqual((self.target / name).resolve(), source)
            self.assertTrue((self.target / name / "SKILL.md").is_file())


if __name__ == "__main__":
    unittest.main()
