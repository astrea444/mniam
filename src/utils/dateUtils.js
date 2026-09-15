const DAYS_PL = [
  "Niedziela",
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
];
const DAYS_SHORT_PL = ["Nie", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"];
const MONTHS_SHORT_PL = [
  "Sty",
  "Lut",
  "Mar",
  "Kwi",
  "Maj",
  "Cze",
  "Lip",
  "Sie",
  "Wrz",
  "Paź",
  "Lis",
  "Gru",
];

export function getDayName(dateInput, short = false) {
  const date = new Date(dateInput);
  const dayIndex = date.getDay();
  return short ? DAYS_SHORT_PL[dayIndex] : DAYS_PL[dayIndex];
}

function toLocalIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getWeekDays(startDate = new Date(), today = new Date(), weekStartsOn = 'monday') {
  const base = new Date(startDate);
  const day = base.getDay();
  const diffToStart = weekStartsOn === 'sunday' ? -day : (day === 0 ? -6 : 1 - day);
  const startDay = new Date(base);
  startDay.setDate(base.getDate() + diffToStart);

  const todayIso = toLocalIso(new Date(today));
  const week = [];
  for (let i = 0; i < 7; i++) {
    const next = new Date(startDay);
    next.setDate(startDay.getDate() + i);
    const isoDate = toLocalIso(next);
    week.push({
      date: isoDate,
      dayName: getDayName(next, true),
      dayNumber: next.getDate(),
      isToday: isoDate === todayIso,
    });
  }
  return week;
}

export function getMonthShortName(dateInput) {
  const date = new Date(dateInput);
  return MONTHS_SHORT_PL[date.getMonth()];
}

export function formatDateShort(dateInput) {
  const date = new Date(dateInput);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
}

export function formatDayMonth(dateInput) {
  const date = new Date(dateInput);
  return `${date.getDate()} ${getMonthShortName(date)}`;
}

export function getTodayIso(now = new Date()) {
  return toLocalIso(new Date(now));
}

export function shiftDateByDays(dateInput, days = 0, now = new Date()) {
  const d = dateInput ? new Date(dateInput) : new Date(now);
  d.setDate(d.getDate() + days);
  return toLocalIso(d);
}

export function getYesterdayIso(dateInput) {
  return shiftDateByDays(dateInput, -1);
}

export function getTomorrowIso(dateInput) {
  return shiftDateByDays(dateInput, 1);
}

export function formatDateLong(dateInput) {
  if (!dateInput) return "";
  const d =
    typeof dateInput === "string" && !dateInput.includes("T")
      ? new Date(dateInput + "T00:00:00")
      : new Date(dateInput);
  return d.toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function getWeekRangeLabel(weekDays) {
  if (!weekDays?.length) return "";
  const first = weekDays[0];
  const last = weekDays[weekDays.length - 1];
  return `${formatDayMonth(first.date)} - ${formatDayMonth(last.date)}`;
}
export { toLocalIso as toIso };
