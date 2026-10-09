// All tab bar geometry, taken from the Figma `Explore` frame (node 2423:9506).
export const TAB_BAR = {
  CONTENT_TOP_PADDING: 15,     // bar top -> top of icons
  ITEM_WIDTH: 55,
  ITEM_HEIGHT: 54,             // icon 36 + gap 5 + label 13
  ICON_SIZE: 36,
  ICON_LABEL_GAP: 5,
  LABEL_FONT_SIZE: 12,
  LABEL_LINE_HEIGHT: 13,
  MIN_BOTTOM_PADDING: 19,      // Figma space below labels; used when the device inset is smaller
  CORNER_RADIUS: 40,
  CENTER_SLOT_WIDTH: 108,      // 2 x 54: inner tab items never come closer than 54 to center
  SIDE_PADDING_MAX: 23,
  SIDE_PADDING_MIN: 12,
  ORB_SPHERE_SIZE: 70,         // visible sphere diameter in Figma
  ORB_IMAGE_SIZE: 78,          // rinpoche_normal.png has ~12% transparent margin: 70 / 0.88 ≈ 78
  ORB_OVERHANG: 31,            // container space above bar top so the 78 image is never clipped (orb center sits 8 below bar top)
  ACTIVE_COLOR: "#242424",
  INACTIVE_COLOR: "#FFFFFF",
  GRADIENT_TOP: "#D7D7D7",
  GRADIENT_TOP_OPACITY: 0.8,
  GRADIENT_BOTTOM: "#868484",
  GRADIENT_BOTTOM_OPACITY: 0.6,
} as const;

export const getTabBarBottomPadding = (bottomInset: number) =>
  Math.max(bottomInset, TAB_BAR.MIN_BOTTOM_PADDING);

// Height of the grey background (from its top edge to the physical screen bottom)
export const getTabBarBackgroundHeight = (bottomInset: number) =>
  TAB_BAR.CONTENT_TOP_PADDING + TAB_BAR.ITEM_HEIGHT + getTabBarBottomPadding(bottomInset);

// Left/right outer padding: Figma's 23 at >= 394 wide, shrinking (min 12) on narrow phones
export const getTabBarSidePadding = (screenWidth: number) => {
  const sideWidth = (screenWidth - TAB_BAR.CENTER_SLOT_WIDTH) / 2;
  const contentWidth = TAB_BAR.ITEM_WIDTH * 2 + 10; // two items + Figma gap
  return Math.max(TAB_BAR.SIDE_PADDING_MIN, Math.min(TAB_BAR.SIDE_PADDING_MAX, sideWidth - contentWidth));
};
