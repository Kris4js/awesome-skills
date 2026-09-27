"""Offline checks for the curated collection layout, not agent behavior."""
import json
import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
COLLECTIONS = ROOT / "collections"


class RepositoryTests(unittest.TestCase):
    def collections(self):
        paths = sorted(path for path in COLLECTIONS.iterdir() if path.is_dir())
        self.assertTrue(paths, "No collections found")
        return paths

    def test_collection_provenance(self):
        for collection in self.collections():
            with self.subTest(collection=collection.name):
                metadata = json.loads((collection / "upstream.json").read_text())
                self.assertRegex(metadata["repository"], r"^https://github\.com/[^/]+/[^/]+$")
                self.assertRegex(metadata["commit"], r"^[0-9a-f]{40}$")
                self.assertEqual(metadata["license"], "MIT")
                self.assertIn("MIT License", (collection / "LICENSE").read_text())
                self.assertIn("Copyright", (collection / "LICENSE").read_text())
                self.assertTrue((collection / "README.md").is_file())

    def test_skill_catalog_matches_snapshot(self):
        for collection in self.collections():
            metadata = json.loads((collection / "upstream.json").read_text())
            discovered = sorted(str(path.relative_to(collection)) for path in
                                (collection / "skills").rglob("SKILL.md"))
            self.assertTrue(discovered)
            self.assertEqual(discovered, metadata["skills"])

    def test_skill_metadata_and_unique_names(self):
        for collection in self.collections():
            names = set()
            for path in (collection / "skills").rglob("SKILL.md"):
                with self.subTest(path=str(path.relative_to(ROOT))):
                    text = path.read_text(encoding="utf-8")
                    match = re.match(r"\A---\r?\n(.*?)\r?\n---(?:\r?\n|$)", text, re.S)
                    self.assertIsNotNone(match, "Missing frontmatter delimiters")
                    header = match.group(1)
                    name = re.search(r"^name:\s*([^\n]+)$", header, re.M)
                    self.assertIsNotNone(name, "Missing name")
                    value = name.group(1).strip().strip("\"'")
                    self.assertEqual(value, path.parent.name)
                    self.assertNotIn(value, names)
                    names.add(value)
                    self.assertRegex(header, r"(?m)^description:\s*\S")
                    self.assertTrue(text[match.end():].strip(), "Empty skill body")

    def test_local_navigation(self):
        documents = [ROOT / "README.md"]
        for collection in self.collections():
            documents.append(collection / "README.md")
            self.assertIn(f"collections/{collection.name}/README.md",
                          (ROOT / "README.md").read_text())
        for document in documents:
            for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", document.read_text()):
                if "://" in target or target.startswith(("#", "mailto:")):
                    continue
                with self.subTest(document=document.name, target=target):
                    self.assertTrue((document.parent / target.split("#", 1)[0]).exists())


if __name__ == "__main__":
    unittest.main()
