"""Generate IHIP, quarterly report, and annual assessment PDFs."""

import os
from datetime import date

from jinja2 import Environment, PackageLoader

from app.config import settings

env = Environment(loader=PackageLoader("app.compliance", "templates"))


def _ensure_output_dir():
    os.makedirs(settings.compliance_pdf_output_dir, exist_ok=True)


def render_ihip(
    student_name: str,
    grade_level: str,
    school_year: str,
    curriculum_materials: dict,
    quarterly_dates: list[str],
    instructors: list[dict],
    parent_name: str,
    district: str = "",
    output_path: str | None = None,
) -> str:
    _ensure_output_dir()
    template = env.get_template("ihip_template.html")
    html = template.render(
        student_name=student_name,
        grade_level=grade_level,
        school_year=school_year,
        curriculum_materials=curriculum_materials,
        quarterly_dates=quarterly_dates,
        instructors=instructors,
        parent_name=parent_name,
        district=district,
        today=date.today().isoformat(),
    )
    if output_path is None:
        safe_name = student_name.lower().replace(" ", "_")
        output_path = os.path.join(
            settings.compliance_pdf_output_dir,
            f"ihip_{safe_name}_{school_year}.html",
        )
    with open(output_path, "w") as f:
        f.write(html)
    return output_path


def render_quarterly_report(
    student_name: str,
    grade_level: str,
    school_year: str,
    quarter: int,
    hours: float,
    material_covered: dict,
    grades_or_narrative: dict,
    under_80_explanation: str | None,
    parent_name: str,
    output_path: str | None = None,
) -> str:
    _ensure_output_dir()
    template = env.get_template("quarterly_report_template.html")
    html = template.render(
        student_name=student_name,
        grade_level=grade_level,
        school_year=school_year,
        quarter=quarter,
        hours=hours,
        material_covered=material_covered,
        grades_or_narrative=grades_or_narrative,
        under_80_explanation=under_80_explanation,
        parent_name=parent_name,
        today=date.today().isoformat(),
    )
    if output_path is None:
        safe_name = student_name.lower().replace(" ", "_")
        output_path = os.path.join(
            settings.compliance_pdf_output_dir,
            f"quarterly_{safe_name}_q{quarter}_{school_year}.html",
        )
    with open(output_path, "w") as f:
        f.write(html)
    return output_path


def render_annual_assessment(
    student_name: str,
    grade_level: str,
    school_year: str,
    assessment_type: str,
    test_name: str | None,
    score: float | None,
    percentile: float | None,
    narrative: str | None,
    meets_threshold: bool | None,
    parent_name: str,
    output_path: str | None = None,
) -> str:
    _ensure_output_dir()
    template = env.get_template("annual_assessment_template.html")
    html = template.render(
        student_name=student_name,
        grade_level=grade_level,
        school_year=school_year,
        assessment_type=assessment_type,
        test_name=test_name,
        score=score,
        percentile=percentile,
        narrative=narrative,
        meets_threshold=meets_threshold,
        parent_name=parent_name,
        today=date.today().isoformat(),
    )
    if output_path is None:
        safe_name = student_name.lower().replace(" ", "_")
        output_path = os.path.join(
            settings.compliance_pdf_output_dir,
            f"assessment_{safe_name}_{school_year}.html",
        )
    with open(output_path, "w") as f:
        f.write(html)
    return output_path
