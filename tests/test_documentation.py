"""Validate owned docs and execute their install examples in isolated fixtures."""
import json
import os
import pathlib
import re
import shutil
import subprocess
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
INSTALL_DOCS = {
    "README.md": ["user"],
    "doc/zh/README.zh-CN.md": ["user"],
    "doc/usage/quickstart.md": ["user", "repo"],
    "doc/zh/quickstart.zh-CN.md": ["user", "repo"],
}
SNIPPETS = re.compile(r"<!-- install:tdd:(user|repo) -->\s*```bash\n(.*?)```", re.S)


class DocumentationTests(unittest.TestCase):
    def test_documentation_entry_points(self):
        required = [*INSTALL_DOCS, "doc/README.md", "doc/usage/skill-matrix.md",
                    "doc/usage/matt-pocock-workflow.md",
                    "doc/design/personal-skill-workflow-design.md", "AGENTS.md", "CONTEXT.md"]
        for name in required:
            with self.subTest(path=name):
                self.assertTrue((ROOT / name).is_file())
        english = (ROOT / "README.md").read_text(encoding="utf-8")
        chinese = (ROOT / "doc/zh/README.zh-CN.md").read_text(encoding="utf-8")
        self.assertIn("doc/zh/README.zh-CN.md", english)
        self.assertIn("../../README.md", chinese)
        for path in ("doc/usage/quickstart.md", "doc/usage/skill-matrix.md",
                     "doc/usage/matt-pocock-workflow.md"):
            self.assertIn(path, english)
        for name in INSTALL_DOCS:
            text = (ROOT / name).read_text(encoding="utf-8")
            self.assertIn("$HOME/.agents/skills", text)
            self.assertIn(".agents/skills", text)
            for marker in ("Codex", "Pi CLI", "PI-Desktop", "$tdd", "/skill:tdd", "/reload", "`Skill`"):
                self.assertIn(marker, text, name)

    def test_bilingual_install_parity(self):
        for english, chinese in (
            ("README.md", "doc/zh/README.zh-CN.md"),
            ("doc/usage/quickstart.md", "doc/zh/quickstart.zh-CN.md"),
        ):
            with self.subTest(english=english, chinese=chinese):
                self.assertEqual(
                    SNIPPETS.findall((ROOT / english).read_text(encoding="utf-8")),
                    SNIPPETS.findall((ROOT / chinese).read_text(encoding="utf-8")),
                )

    def test_owned_document_links(self):
        documents = [ROOT / "README.md", ROOT / "AGENTS.md", ROOT / "CONTEXT.md",
                     *sorted((ROOT / "doc").rglob("*.md"))]
        for document in documents:
            text = document.read_text(encoding="utf-8")
            self.assertEqual(len(re.findall(r"^```", text, re.M)) % 2, 0, str(document))
            for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", text):
                if "://" in target or target.startswith(("#", "mailto:")):
                    continue
                with self.subTest(document=document.name, target=target):
                    self.assertTrue((document.parent / target.split("#", 1)[0]).exists())

    def test_install_examples(self):
        self.assertIsNotNone(shutil.which("bash"), "Install examples require Bash")
        for document, scopes in INSTALL_DOCS.items():
            snippets = SNIPPETS.findall((ROOT / document).read_text(encoding="utf-8"))
            self.assertEqual([scope for scope, _ in snippets], scopes, document)
            for scope, script in snippets:
                with self.subTest(document=document, scope=scope), tempfile.TemporaryDirectory() as tmp:
                    fixture = pathlib.Path(tmp)
                    work = fixture / "repository"
                    home = fixture / "home"
                    home.mkdir()
                    source = work / "collections/mattpocock"
                    source.mkdir(parents=True)
                    original = ROOT / "collections/mattpocock"
                    shutil.copytree(original / "skills/engineering/tdd", source / "skills/engineering/tdd")
                    for name in ("LICENSE", "upstream.json"):
                        shutil.copy2(original / name, source / name)
                    env = {**os.environ, "HOME": str(home), "BASH_ENV": "/dev/null"}
                    target = (home if scope == "user" else work) / ".agents/skills/tdd"
                    result = subprocess.run(["bash", "--noprofile", "--norc", "-c", script],
                                            cwd=work, env=env, capture_output=True, text=True)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    overview = document in ("README.md", "doc/zh/README.zh-CN.md")
                    license_name = "LICENSE" if overview else "LICENSE.mattpocock"
                    source_name = "upstream.json" if overview else "UPSTREAM.mattpocock.json"
                    for path in (original / "skills/engineering/tdd").rglob("*"):
                        if path.is_file():
                            relative = path.relative_to(original / "skills/engineering/tdd")
                            self.assertEqual(path.read_bytes(), (target / relative).read_bytes())
                    self.assertEqual((original / "LICENSE").read_bytes(),
                                     (target / license_name).read_bytes())
                    self.assertEqual(json.loads((original / "upstream.json").read_text()),
                                     json.loads((target / source_name).read_text()))
                    sentinel = target / "SKILL.md"
                    sentinel.write_text("local user edits", encoding="utf-8")
                    result = subprocess.run(["bash", "--noprofile", "--norc", "-c", script],
                                            cwd=work, env=env, capture_output=True, text=True)
                    self.assertNotEqual(result.returncode, 0, "Existing installs must not be overwritten")
                    self.assertEqual(sentinel.read_text(), "local user edits")
                    shutil.rmtree(target)
                    missing = fixture / "absent"
                    target.symlink_to(missing)
                    result = subprocess.run(["bash", "--noprofile", "--norc", "-c", script],
                                            cwd=work, env=env, capture_output=True, text=True)
                    self.assertNotEqual(result.returncode, 0, "Dangling symlinks must not be followed")
                    self.assertTrue(target.is_symlink())
                    self.assertFalse(missing.exists())


if __name__ == "__main__":
    unittest.main()
