# 🏰 ילדים גיבורים — מרתף החולדות 🐀
# Hero Kids — Basement O' Rats

משחק RPG אינטראקטיבי בעברית מבוסס על ההרפתקה "Basement O' Rats" מסדרת Hero Kids.

An interactive Hebrew RPG based on the "Basement O' Rats" adventure from the Hero Kids RPG series by Justin Halliday.

## 🎮 שחקו עכשיו / Play Now

👉 [hero-kids-game](https://YOUR_USERNAME.github.io/hero-kids-game/)

## ✨ מה כולל המשחק / Features

- **5 מפגשים מלאים** — מהמרתף עד מאורת מלך החולדות
- **10 גיבורים לבחירה** — לוחמים, ציידים, מכשפים, גברתן, נוכל, מרפא, אביר
- **מנגנון קרב מלא** — קוביות, תנועה על גריד, התקפה, הגנה
- **AI חכם לחולדות** — זזות לכיוון הגיבורים ותוקפות
- **מבחני יכולת** — תפיסה, מעקב, טיפוס, זריזות
- **בחירות במשחק** — ללכת צפון (בוס) או דרום (בריכה מסתורית)
- **בוס מלך החולדות** — עם 3 נקודות חיים ו-2 קוביות התקפה
- **ממשק עברי מלא** — RTL, טקסט נרטיבי, יומן קרב

## 🚀 התקנה מקומית / Local Setup

```bash
git clone https://github.com/YOUR_USERNAME/hero-kids-game.git
cd hero-kids-game
npm install
npm run dev
```

## 📦 פריסה / Deploy

### GitHub Pages (אוטומטי)
הפרויקט כולל GitHub Actions workflow שמפרסם אוטומטית ל-GitHub Pages בכל push ל-main.

1. בהגדרות הריפו: Settings → Pages → Source: GitHub Actions
2. עדכנו את `base` ב-`vite.config.js` לשם הריפו שלכם
3. דחפו ל-main — הפריסה תתחיל אוטומטית

### ידני
```bash
npm run build
# העלו את תיקיית dist לכל שרת סטטי
```

## 🎲 איך משחקים / How to Play

1. **בחרו גיבורים** — 1-4 גיבורים (מומלץ: לוחם + מרפא)
2. **קראו את הסיפור** — לחצו "המשיכו" לקדם את הנרטיב
3. **קרב!**
   - לחצו על גיבור כדי לבחור אותו
   - משבצות ירוקות = תנועה
   - משבצות אדומות = התקפה
   - כפתור שיקוי = ריפוי
4. **סיימו תור** — החולדות זזות ותוקפות
5. **המשיכו** — עד שתנצחו את מלך החולדות ותצילו את רוג׳ר!

## 📝 קרדיטים / Credits

- **Hero Kids RPG** — Justin Halliday ([heroforgegames.com](https://heroforgegames.com))
- **גרסה דיגיטלית** — נבנה עם React + Vite
- **משחק ההרפתקאה המקורי** — "Basement O' Rats" מסדרת Hero Kids

> ⚠️ פרויקט זה נבנה למטרות אישיות/חינוכיות. Hero Kids הוא סימן מסחרי של Justin Halliday.

## 🛠️ טכנולוגיה / Tech Stack

- React 18
- Vite 5
- GitHub Actions + GitHub Pages
- No external dependencies (pure React)
