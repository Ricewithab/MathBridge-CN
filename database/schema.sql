-- MathBridge CN database architecture
-- Concept: one mathematical idea mapped across China, UK and US curricula

CREATE TABLE countries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  language TEXT
);

CREATE TABLE curriculum_frameworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  country_id TEXT NOT NULL,
  name TEXT NOT NULL,
  authority TEXT,
  year TEXT,
  FOREIGN KEY(country_id) REFERENCES countries(id)
);

CREATE TABLE grades (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE grade_equivalency (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  china_grade INTEGER,
  uk_year INTEGER,
  us_grade INTEGER,
  notes TEXT
);

CREATE TABLE domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

CREATE TABLE concepts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_id INTEGER,
  name_en TEXT NOT NULL,
  name_cn TEXT,
  parent_id INTEGER,
  FOREIGN KEY(domain_id) REFERENCES domains(id),
  FOREIGN KEY(parent_id) REFERENCES concepts(id)
);

CREATE TABLE curriculum_expectations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_id INTEGER NOT NULL,
  framework_id INTEGER NOT NULL,
  grade_id INTEGER,
  standard_code TEXT,
  official_description TEXT,
  teacher_translation TEXT,
  FOREIGN KEY(concept_id) REFERENCES concepts(id),
  FOREIGN KEY(framework_id) REFERENCES curriculum_frameworks(id),
  FOREIGN KEY(grade_id) REFERENCES grades(id)
);

CREATE TABLE teaching_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_id INTEGER NOT NULL,
  country_id TEXT NOT NULL,
  approach TEXT,
  representations TEXT,
  teacher_emphasis TEXT,
  FOREIGN KEY(concept_id) REFERENCES concepts(id),
  FOREIGN KEY(country_id) REFERENCES countries(id)
);

CREATE TABLE lesson_examples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_id INTEGER NOT NULL,
  country_id TEXT NOT NULL,
  activity TEXT,
  teacher_questions TEXT,
  student_actions TEXT,
  FOREIGN KEY(concept_id) REFERENCES concepts(id),
  FOREIGN KEY(country_id) REFERENCES countries(id)
);

CREATE TABLE sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT,
  title TEXT,
  organisation TEXT,
  url TEXT,
  reliability INTEGER
);

CREATE TABLE concept_sources (
  concept_id INTEGER,
  source_id INTEGER,
  FOREIGN KEY(concept_id) REFERENCES concepts(id),
  FOREIGN KEY(source_id) REFERENCES sources(id)
);
