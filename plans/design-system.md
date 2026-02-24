# Design System v1 (Mono-Minimal Soft)

## Color tokens
- background: `#FFFFFF`
- surface: `#FAFAFA`
- elevated: `#FFFFFF`
- border: `#E9E9E9`
- textPrimary: `#111111`
- textSecondary: `#5B5B5B`
- textMuted: `#888888`

## Spacing scale
- xs `4`
- sm `8`
- md `12`
- lg `16`
- xl `20`
- xxl `24`
- xxxl `32`

## Radius scale
- sm `10`
- md `14`
- lg `18`
- xl `24`
- pill `999`

## Elevation rules
- Base cards: subtle border + soft shadow
- Avoid stacked deep shadows
- Keep same shadow recipe across cards/sheets

## Typography scale
- display `28`
- h1 `22`
- h2 `18`
- body `15`
- caption `13`
- micro `11`

## Motion rules
- Fast: `140ms`
- Normal: `220ms`
- Use only for state transitions and press feedback
- No decorative looping animation in v1

## Component inventory (v1)
- Shell: app frame + tab bar
- Primitives: Card, Text, Button, Input, Chip, Sheet, Stat
- Feature: transaction row, review queue card, insight card, chart cards
- States: loading, empty, error placeholders for each key screen
