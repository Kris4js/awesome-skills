"""Offline integrity and installation checks for the pinned Archify package."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "collections/architecture/archify"


def inventory(directory, excluded=()):
    return {p.relative_to(directory).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(directory.rglob("*"))
            if p.is_file() and p.relative_to(directory).as_posix() not in excluded}


class ArchifyTests(unittest.TestCase):
    def test_snapshot_integrity(self):
        metadata = json.loads((PACKAGE / "upstream.json").read_text())
        snapshot = metadata["snapshot"]
        self.assertEqual(snapshot["excluded_owned_files"], ["README.md", "upstream.json"])
        files = inventory(PACKAGE, snapshot["excluded_owned_files"])
        self.assertEqual(len(files), snapshot["file_count"])
        entries = "".join(f"{digest}  {name}\n" for name, digest in sorted(files.items()))
        self.assertEqual(hashlib.sha256(entries.encode()).hexdigest(), snapshot["tree_sha256"])
        release = json.loads((PACKAGE / "skill-release.json").read_text())
        package = json.loads((PACKAGE / "package.json").read_text())
        self.assertEqual(metadata["version"], release["version"])
        self.assertEqual(metadata["version"], package["version"])
        self.assertEqual(metadata["channel"], release["channel"])
        self.assertEqual(metadata["runtime_requirements"]["node"], package["engines"]["node"])
        self.assertTrue((PACKAGE / metadata["third_party_notices"]).is_file())

    def test_install_example(self):
        text = (PACKAGE / "README.md").read_text(encoding="utf-8")
        match = re.search(r"<!-- install:archify:user -->\s*```bash\n(.*?)```", text, re.S)
        self.assertIsNotNone(match)
        script = match.group(1)
        self.assertEqual(len(script.strip().splitlines()), 2)
        for scope in ("user", "repo"):
            with self.subTest(scope=scope), tempfile.TemporaryDirectory() as temporary:
                fixture = Path(temporary)
                home = fixture / "home with spaces"
                work = fixture / "repository"
                home.mkdir()
                shutil.copytree(PACKAGE, work / "collections/architecture/archify")
                command = script if scope == "user" else script.replace("$HOME/.agents/skills", ".agents/skills")
                target = (home if scope == "user" else work) / ".agents/skills/archify"
                env = {**os.environ, "HOME": str(home), "BASH_ENV": "/dev/null"}

                def run():
                    return subprocess.run(["bash", "--noprofile", "--norc", "-c", command],
                                          cwd=work, env=env, capture_output=True, text=True)

                result = run()
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(inventory(target), inventory(PACKAGE))
                (target / "SKILL.md").write_text("local edits")
                self.assertNotEqual(run().returncode, 0)
                self.assertEqual((target / "SKILL.md").read_text(), "local edits")
                shutil.rmtree(target)
                target.symlink_to(fixture / "missing")
                self.assertNotEqual(run().returncode, 0)
                self.assertTrue(target.is_symlink())
                self.assertFalse((fixture / "missing").exists())


if __name__ == "__main__":
    unittest.main()
