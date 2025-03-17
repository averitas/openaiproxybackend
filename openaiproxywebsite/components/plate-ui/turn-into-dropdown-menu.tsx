"use client";

import React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { styled } from "@mui/material/styles";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { CodeBlockPlugin } from "@udecode/plate-code-block/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { INDENT_LIST_KEYS, ListStyleType } from "@udecode/plate-indent-list";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import {
  ParagraphPlugin,
  useEditorRef,
  useSelectionFragmentProp,
} from "@udecode/plate/react";
import {
  ChevronRightIcon,
  Columns3Icon,
  FileCodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  QuoteIcon,
  SquareIcon,
} from "lucide-react";

import {
  getBlockType,
  setBlockType,
  STRUCTURAL_TYPES,
} from "@/components/editor/transforms";

const StyledMenuItem = styled(MenuItem)({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  minWidth: "180px",
  "& svg": {
    width: "16px",
    height: "16px",
  },
});

const StyledButton = styled(Button)({
  minWidth: "125px",
  textTransform: "none",
  justifyContent: "space-between",
  padding: "8px 16px",
  color: "inherit",
  backgroundColor: "transparent",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
});

const turnIntoItems = [
  {
    icon: <PilcrowIcon />,
    keywords: ["paragraph"],
    label: "Text",
    value: ParagraphPlugin.key,
  },
  {
    icon: <Heading1Icon />,
    keywords: ["title", "h1"],
    label: "Heading 1",
    value: HEADING_KEYS.h1,
  },
  {
    icon: <Heading2Icon />,
    keywords: ["subtitle", "h2"],
    label: "Heading 2",
    value: HEADING_KEYS.h2,
  },
  {
    icon: <Heading3Icon />,
    keywords: ["subtitle", "h3"],
    label: "Heading 3",
    value: HEADING_KEYS.h3,
  },
  {
    icon: <ListIcon />,
    keywords: ["unordered", "ul", "-"],
    label: "Bulleted list",
    value: ListStyleType.Disc,
  },
  {
    icon: <ListOrderedIcon />,
    keywords: ["ordered", "ol", "1"],
    label: "Numbered list",
    value: ListStyleType.Decimal,
  },
  {
    icon: <SquareIcon />,
    keywords: ["checklist", "task", "checkbox", "[]"],
    label: "To-do list",
    value: INDENT_LIST_KEYS.todo,
  },
  {
    icon: <ChevronRightIcon />,
    keywords: ["collapsible", "expandable"],
    label: "Toggle list",
    value: TogglePlugin.key,
  },
  {
    icon: <FileCodeIcon />,
    keywords: ["```"],
    label: "Code",
    value: CodeBlockPlugin.key,
  },
  {
    icon: <QuoteIcon />,
    keywords: ["citation", "blockquote", ">"],
    label: "Quote",
    value: BlockquotePlugin.key,
  },
  {
    icon: <Columns3Icon />,
    label: "3 columns",
    value: "action_three_columns",
  },
];

export function TurnIntoDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const value = useSelectionFragmentProp({
    defaultValue: ParagraphPlugin.key,
    structuralTypes: STRUCTURAL_TYPES,
    getProp: (node) => getBlockType(node as any),
  });
  const selectedItem = React.useMemo(
    () =>
      turnIntoItems.find(
        (item) => item.value === (value ?? ParagraphPlugin.key)
      ) ?? turnIntoItems[0],
    [value]
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    editor.tf.focus();
  };

  const handleMenuItemClick = (itemValue: string) => {
    setBlockType(editor, itemValue);
    handleClose();
  };

  return (
    <>
      <StyledButton
        aria-controls={open ? "turn-into-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        {selectedItem.label}
      </StyledButton>
      <Menu
        {...props}
        id="turn-into-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "turn-into-button",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {turnIntoItems.map(({ icon, label, value: itemValue }) => (
          <StyledMenuItem
            key={itemValue}
            selected={itemValue === value}
            onClick={() => handleMenuItemClick(itemValue)}
          >
            {icon}
            {label}
          </StyledMenuItem>
        ))}
      </Menu>
    </>
  );
}
