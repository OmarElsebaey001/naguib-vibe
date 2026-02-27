"""Operation types that the AI agent can produce, mapped to RFC 6902 JSON Patch."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel


class ReplaceAllOperation(BaseModel):
    type: Literal["replace_all"] = "replace_all"
    config: dict[str, Any]


class AddSectionOperation(BaseModel):
    type: Literal["add_section"] = "add_section"
    section: dict[str, Any]
    position: int | None = None  # None = append at end


class RemoveSectionOperation(BaseModel):
    type: Literal["remove_section"] = "remove_section"
    section_id: str


class MoveSectionOperation(BaseModel):
    type: Literal["move_section"] = "move_section"
    section_id: str
    to_position: int


class UpdateContentOperation(BaseModel):
    type: Literal["update_content"] = "update_content"
    section_id: str
    path: str  # dot-path within content, e.g. "headline" or "features.0.title"
    value: Any


class SwapVariantOperation(BaseModel):
    type: Literal["swap_variant"] = "swap_variant"
    section_id: str
    variant: str


class SetModeOperation(BaseModel):
    type: Literal["set_mode"] = "set_mode"
    section_id: str
    mode: str  # "light" | "dark"


class SetThemeOperation(BaseModel):
    type: Literal["set_theme"] = "set_theme"
    updates: dict[str, str]  # key = theme property, value = new value


Operation = (
    ReplaceAllOperation
    | AddSectionOperation
    | RemoveSectionOperation
    | MoveSectionOperation
    | UpdateContentOperation
    | SwapVariantOperation
    | SetModeOperation
    | SetThemeOperation
)


def find_section_index(sections: list[dict], section_id: str) -> int:
    for i, s in enumerate(sections):
        if s.get("id") == section_id:
            return i
    raise ValueError(f"Section {section_id} not found")


def operations_to_patches(operations: list[dict], current_config: dict) -> list[dict]:
    """Convert high-level operations to RFC 6902 JSON Patch operations."""
    patches: list[dict] = []
    sections = current_config.get("sections", [])

    for op in operations:
        op_type = op.get("type")

        if op_type == "add_section":
            pos = op.get("position")
            if pos is not None:
                patches.append({"op": "add", "path": f"/sections/{pos}", "value": op["section"]})
            else:
                patches.append({"op": "add", "path": "/sections/-", "value": op["section"]})

        elif op_type == "remove_section":
            idx = find_section_index(sections, op["section_id"])
            patches.append({"op": "remove", "path": f"/sections/{idx}"})

        elif op_type == "move_section":
            from_idx = find_section_index(sections, op["section_id"])
            to_idx = op["to_position"]
            patches.append({"op": "move", "from": f"/sections/{from_idx}", "path": f"/sections/{to_idx}"})

        elif op_type == "update_content":
            idx = find_section_index(sections, op["section_id"])
            content_path = op["path"].replace(".", "/")
            patches.append({"op": "replace", "path": f"/sections/{idx}/content/{content_path}", "value": op["value"]})

        elif op_type == "swap_variant":
            idx = find_section_index(sections, op["section_id"])
            patches.append({"op": "replace", "path": f"/sections/{idx}/variant", "value": op["variant"]})

        elif op_type == "set_mode":
            idx = find_section_index(sections, op["section_id"])
            patches.append({"op": "replace", "path": f"/sections/{idx}/mode", "value": op["mode"]})

        elif op_type == "set_theme":
            for key, value in op["updates"].items():
                patches.append({"op": "replace", "path": f"/theme/{key}", "value": value})

    return patches
