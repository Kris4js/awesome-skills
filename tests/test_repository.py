"""Offline checks for series and domain collections, not agent behavior."""
import json
import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
COLLECTIONS = ROOT / "collections"


def read(path):
    return path.read_text(encoding="utf-8")


class RepositoryTests(unittest.TestCase):
    def collections(self):
        paths = sorted(path for path in COLLECTIONS.iterdir() if path.is_dir())
        self.assertTrue(paths, "No collections found")
        return paths

    def sources(self):
        manifests = sorted([*COLLECTIONS.glob("*/upstream.json"),
                            *COLLECTIONS.glob("*/*/upstream.json")])
        self.assertTrue(manifests, "No source manifests found")
        return [(path.parent, json.loads(read(path))) for path in manifests]

    def local_path(self, base, value):
        self.assertIsInstance(value, str)
        self.assertTrue(value)
        relative = pathlib.PurePosixPath(value)
        self.assertFalse(relative.is_absolute())
        self.assertNotIn("..", relative.parts)
        path = (base / value).resolve()
        self.assertTrue(path == base.resolve() or base.resolve() in path.parents)
        return path

    def assert_repository_version(self, metadata):
        self.assertRegex(metadata["repository"], r"^https://github\.com/[^/]+/[^/]+$")
        self.assertRegex(metadata["commit"], r"^[0-9a-f]{40}$")

    def test_collection_layout(self):
        sources = dict(self.sources())
        for collection in self.collections():
            with self.subTest(collection=collection.name):
                self.assertTrue((collection / "README.md").is_file())
                if collection in sources:
                    self.assertEqual(sources[collection]["kind"], "series")
                else:
                    skills = [path for path in collection.iterdir() if path.is_dir()]
                    self.assertTrue(skills, "Empty domain collection")
                    for skill in skills:
                        self.assertIn(skill, sources, "Skill is missing its source record")
                        self.assertEqual(sources[skill]["kind"], "skill")
                        self.assertTrue((skill / "SKILL.md").is_file())

    def test_source_provenance_and_license_status(self):
        for source, metadata in self.sources():
            with self.subTest(source=str(source.relative_to(ROOT))):
                self.assert_repository_version(metadata)
                self.local_path(source, metadata["source_path"])
                self.assertTrue((source / "README.md").is_file())
                if metadata["license"] is None:
                    self.assertEqual(metadata["license_status"], "not-found")
                    self.assertIsNone(metadata["license_file"])
                    notice = self.local_path(source, metadata["license_notice"])
                    self.assertTrue(read(notice).strip(), "Missing license status explanation")
                else:
                    self.assertIsInstance(metadata["license"], str)
                    self.assertTrue(metadata["license"].strip())
                    license_path = self.local_path(source, metadata["license_file"])
                    self.assertTrue(read(license_path).strip())

    def test_skill_catalog_matches_snapshot(self):
        catalog = []
        for source, metadata in self.sources():
            discovered = sorted(str(path.relative_to(source)) for path in source.rglob("SKILL.md"))
            self.assertTrue(discovered)
            self.assertEqual(discovered, metadata["skills"])
            for name in metadata["skills"]:
                path = self.local_path(source, name)
                self.assertTrue(path.is_file())
                catalog.append(path)
        self.assertEqual(len(catalog), len(set(catalog)), "Skill belongs to multiple sources")
        self.assertEqual(sorted(catalog), sorted(path.resolve() for path in
                                                COLLECTIONS.rglob("SKILL.md")),
                         "Uncatalogued skill found")

    def test_declared_supporting_files(self):
        for source, metadata in self.sources():
            files = metadata.get("files", metadata["skills"])
            self.assertEqual(len(files), len(set(files)))
            self.assertTrue(set(metadata["skills"]).issubset(files))
            for name in files:
                with self.subTest(source=source.name, file=name):
                    path = self.local_path(source, name)
                    self.assertTrue(path.is_file(), "Missing snapshot file")
                    self.assertTrue(path.read_bytes(), "Empty snapshot file")

    def test_skill_metadata_and_unique_names(self):
        for collection in self.collections():
            names = set()
            for path in collection.rglob("SKILL.md"):
                with self.subTest(path=str(path.relative_to(ROOT))):
                    text = read(path)
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

    def test_external_dependencies(self):
        for source, metadata in self.sources():
            for dependency in metadata.get("dependencies", []):
                with self.subTest(source=source.name, dependency=dependency["name"]):
                    self.assert_repository_version(dependency)
                    self.assertIs(dependency["vendored"], False)
                    self.assertTrue(dependency["required_paths"])
                    self.assertTrue(dependency["verification"].strip())
                    self.assertIn(dependency["repository"], read(source / "README.md"))
                    if dependency["license"] is None:
                        self.assertEqual(dependency["license_status"], "not-found")

    def test_local_navigation(self):
        documents = {ROOT / "README.md"}
        for collection in self.collections():
            documents.add(collection / "README.md")
            self.assertIn(f"collections/{collection.name}/README.md", read(ROOT / "README.md"))
        for source, _ in self.sources():
            documents.add(source / "README.md")
            if source.parent != COLLECTIONS:
                self.assertIn(f"{source.name}/README.md", read(source.parent / "README.md"))
        for document in sorted(documents):
            self.assertEqual(len(re.findall(r"^```", read(document), re.M)) % 2, 0)
            for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", read(document)):
                if "://" in target or target.startswith(("#", "mailto:")):
                    continue
                with self.subTest(document=str(document.relative_to(ROOT)), target=target):
                    self.assertTrue((document.parent / target.split("#", 1)[0]).exists())


if __name__ == "__main__":
    unittest.main()
