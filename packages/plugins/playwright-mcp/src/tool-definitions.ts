import { RAW_TOOL_NAME } from "./constants.js";

export type PlaywrightToolDefinition = {
  name: string;
  displayName: string;
  description: string;
  capability: "core" | "network" | "storage" | "testing" | "vision" | "pdf" | "devtools" | "config" | "raw";
};

export const PLAYWRIGHT_TOOLS: PlaywrightToolDefinition[] = [
  { name: "browser_navigate", displayName: "Browser Navigate", description: "Navigate to a URL.", capability: "core" },
  { name: "browser_navigate_back", displayName: "Browser Navigate Back", description: "Go back in browser history.", capability: "core" },
  { name: "browser_navigate_forward", displayName: "Browser Navigate Forward", description: "Go forward in browser history.", capability: "core" },
  { name: "browser_reload", displayName: "Browser Reload", description: "Reload the current page.", capability: "core" },
  { name: "browser_snapshot", displayName: "Browser Snapshot", description: "Capture an accessibility snapshot.", capability: "core" },
  { name: "browser_click", displayName: "Browser Click", description: "Click an element by accessibility ref.", capability: "core" },
  { name: "browser_hover", displayName: "Browser Hover", description: "Hover over an element by accessibility ref.", capability: "core" },
  { name: "browser_drag", displayName: "Browser Drag", description: "Drag and drop between elements.", capability: "core" },
  { name: "browser_select_option", displayName: "Browser Select Option", description: "Select an option in a dropdown.", capability: "core" },
  { name: "browser_type", displayName: "Browser Type", description: "Type text into an element.", capability: "core" },
  { name: "browser_press_key", displayName: "Browser Press Key", description: "Press a keyboard key.", capability: "core" },
  { name: "browser_fill_form", displayName: "Browser Fill Form", description: "Fill multiple form fields.", capability: "core" },
  { name: "browser_check", displayName: "Browser Check", description: "Check a checkbox or radio input.", capability: "core" },
  { name: "browser_uncheck", displayName: "Browser Uncheck", description: "Uncheck a checkbox.", capability: "core" },
  { name: "browser_take_screenshot", displayName: "Browser Take Screenshot", description: "Take a PNG or JPEG screenshot.", capability: "core" },
  { name: "browser_run_code", displayName: "Browser Run Code", description: "Execute Playwright code in the browser session.", capability: "core" },
  { name: "browser_wait_for", displayName: "Browser Wait For", description: "Wait for text, element, or time.", capability: "core" },
  { name: "browser_evaluate", displayName: "Browser Evaluate", description: "Evaluate JavaScript on the page.", capability: "core" },
  { name: "browser_handle_dialog", displayName: "Browser Handle Dialog", description: "Accept or dismiss browser dialogs.", capability: "core" },
  { name: "browser_file_upload", displayName: "Browser File Upload", description: "Upload files to a file input.", capability: "core" },
  { name: "browser_console_messages", displayName: "Browser Console Messages", description: "Read browser console output.", capability: "core" },
  { name: "browser_network_requests", displayName: "Browser Network Requests", description: "List network requests.", capability: "core" },
  { name: "browser_tabs", displayName: "Browser Tabs", description: "List, create, close, or switch browser tabs.", capability: "core" },
  { name: "browser_close", displayName: "Browser Close", description: "Close the browser.", capability: "core" },
  { name: "browser_resize", displayName: "Browser Resize", description: "Resize the browser window.", capability: "core" },
  { name: "browser_route", displayName: "Browser Route", description: "Mock requests matching a URL pattern.", capability: "network" },
  { name: "browser_route_list", displayName: "Browser Route List", description: "List active mocked routes.", capability: "network" },
  { name: "browser_unroute", displayName: "Browser Unroute", description: "Remove mocked routes.", capability: "network" },
  { name: "browser_network_state_set", displayName: "Browser Network State Set", description: "Set browser online or offline state.", capability: "network" },
  { name: "browser_cookie_list", displayName: "Browser Cookie List", description: "List browser cookies.", capability: "storage" },
  { name: "browser_cookie_get", displayName: "Browser Cookie Get", description: "Read a browser cookie.", capability: "storage" },
  { name: "browser_cookie_set", displayName: "Browser Cookie Set", description: "Set a browser cookie.", capability: "storage" },
  { name: "browser_cookie_delete", displayName: "Browser Cookie Delete", description: "Delete a browser cookie.", capability: "storage" },
  { name: "browser_cookie_clear", displayName: "Browser Cookie Clear", description: "Clear browser cookies.", capability: "storage" },
  { name: "browser_localstorage_list", displayName: "Browser LocalStorage List", description: "List localStorage entries.", capability: "storage" },
  { name: "browser_localstorage_get", displayName: "Browser LocalStorage Get", description: "Read a localStorage entry.", capability: "storage" },
  { name: "browser_localstorage_set", displayName: "Browser LocalStorage Set", description: "Set a localStorage entry.", capability: "storage" },
  { name: "browser_localstorage_delete", displayName: "Browser LocalStorage Delete", description: "Delete a localStorage entry.", capability: "storage" },
  { name: "browser_localstorage_clear", displayName: "Browser LocalStorage Clear", description: "Clear localStorage entries.", capability: "storage" },
  { name: "browser_sessionstorage_list", displayName: "Browser SessionStorage List", description: "List sessionStorage entries.", capability: "storage" },
  { name: "browser_sessionstorage_get", displayName: "Browser SessionStorage Get", description: "Read a sessionStorage entry.", capability: "storage" },
  { name: "browser_sessionstorage_set", displayName: "Browser SessionStorage Set", description: "Set a sessionStorage entry.", capability: "storage" },
  { name: "browser_sessionstorage_delete", displayName: "Browser SessionStorage Delete", description: "Delete a sessionStorage entry.", capability: "storage" },
  { name: "browser_sessionstorage_clear", displayName: "Browser SessionStorage Clear", description: "Clear sessionStorage entries.", capability: "storage" },
  { name: "browser_storage_state", displayName: "Browser Storage State", description: "Save cookies and localStorage to a file.", capability: "storage" },
  { name: "browser_set_storage_state", displayName: "Browser Set Storage State", description: "Restore a saved browser storage state.", capability: "storage" },
  { name: "browser_verify_element_visible", displayName: "Browser Verify Element Visible", description: "Assert an element is visible by role and name.", capability: "testing" },
  { name: "browser_verify_text_visible", displayName: "Browser Verify Text Visible", description: "Assert text is visible.", capability: "testing" },
  { name: "browser_verify_list_visible", displayName: "Browser Verify List Visible", description: "Assert a list with items is visible.", capability: "testing" },
  { name: "browser_verify_value", displayName: "Browser Verify Value", description: "Assert a form field value.", capability: "testing" },
  { name: "browser_generate_locator", displayName: "Browser Generate Locator", description: "Generate a Playwright locator for test code.", capability: "testing" },
  { name: "browser_mouse_move_xy", displayName: "Browser Mouse Move XY", description: "Move mouse to coordinates.", capability: "vision" },
  { name: "browser_mouse_click_xy", displayName: "Browser Mouse Click XY", description: "Click at coordinates.", capability: "vision" },
  { name: "browser_mouse_drag_xy", displayName: "Browser Mouse Drag XY", description: "Drag between coordinates.", capability: "vision" },
  { name: "browser_mouse_down", displayName: "Browser Mouse Down", description: "Press the mouse button.", capability: "vision" },
  { name: "browser_mouse_up", displayName: "Browser Mouse Up", description: "Release the mouse button.", capability: "vision" },
  { name: "browser_mouse_wheel", displayName: "Browser Mouse Wheel", description: "Scroll with the mouse wheel.", capability: "vision" },
  { name: "browser_pdf_save", displayName: "Browser PDF Save", description: "Export the current page as a PDF.", capability: "pdf" },
  { name: "browser_start_tracing", displayName: "Browser Start Tracing", description: "Start recording an execution trace.", capability: "devtools" },
  { name: "browser_stop_tracing", displayName: "Browser Stop Tracing", description: "Stop recording and save the trace.", capability: "devtools" },
  { name: "browser_start_video", displayName: "Browser Start Video", description: "Start session video recording.", capability: "devtools" },
  { name: "browser_stop_video", displayName: "Browser Stop Video", description: "Stop video recording and save the video.", capability: "devtools" },
  { name: "browser_video_chapter", displayName: "Browser Video Chapter", description: "Add a video chapter marker.", capability: "devtools" },
  { name: "browser_resume", displayName: "Browser Resume", description: "Resume paused browser execution.", capability: "devtools" },
  { name: "browser_get_config", displayName: "Browser Get Config", description: "Get resolved Playwright MCP configuration.", capability: "config" },
];

export const ALL_TOOL_NAMES = PLAYWRIGHT_TOOLS.map((tool) => tool.name);

export const RAW_TOOL = {
  name: RAW_TOOL_NAME,
  displayName: "Browser Call MCP Tool",
  description: "Call any discovered Playwright MCP tool by name.",
  capability: "raw",
} satisfies PlaywrightToolDefinition;

export function toolCount() {
  return PLAYWRIGHT_TOOLS.length + 1;
}
