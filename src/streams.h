#pragma once

#include "event.h"

typedef struct {
  MenuLayer *layer;
  uint16_t count;
  char *query;
  char **titles;
  char **first_subtitles;
  char **second_subtitles;
  // Icon that will be used for the number of viewers
  GBitmap *viewer_icon;

  // The following are for text-scrolling
  bool scrolling_still_required;
  bool subtitle_scrolling_required;
  int menu_scroll_offset;
  bool menu_reloading_to_scroll;
  AppTimer *menu_scroll_timer;
  bool moving_forwards_in_menu;
} StreamsMenu;

void streams_window_init(char *query);
