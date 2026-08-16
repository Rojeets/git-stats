import { mergeCalendars } from "../mergeCalendars";

describe("mergeCalendars", () => {
  it("returns empty array when given no calendars", () => {
    expect(mergeCalendars()).toEqual([]);
  });

  it("returns a single calendar unchanged", () => {
    const cal = [
      { date: "2025-01-01", count: 5 },
      { date: "2025-01-02", count: 3 },
    ];
    expect(mergeCalendars(cal)).toEqual(cal);
  });

  it("sums counts on overlapping dates", () => {
    const a = [{ date: "2025-01-01", count: 5 }];
    const b = [{ date: "2025-01-01", count: 3 }];
    expect(mergeCalendars(a, b)).toEqual([{ date: "2025-01-01", count: 8 }]);
  });

  it("unions non-overlapping dates", () => {
    const a = [{ date: "2025-01-01", count: 5 }];
    const b = [{ date: "2025-01-03", count: 2 }];
    expect(mergeCalendars(a, b)).toEqual([
      { date: "2025-01-01", count: 5 },
      { date: "2025-01-03", count: 2 },
    ]);
  });

  it("handles three calendars", () => {
    const a = [{ date: "2025-06-01", count: 1 }];
    const b = [{ date: "2025-06-01", count: 2 }];
    const c = [{ date: "2025-06-01", count: 3 }];
    expect(mergeCalendars(a, b, c)).toEqual([{ date: "2025-06-01", count: 6 }]);
  });

  it("returns results sorted by date ascending", () => {
    const a = [{ date: "2025-03-01", count: 1 }];
    const b = [{ date: "2025-01-01", count: 2 }];
    const c = [{ date: "2025-02-01", count: 3 }];
    expect(mergeCalendars(a, b, c)).toEqual([
      { date: "2025-01-01", count: 2 },
      { date: "2025-02-01", count: 3 },
      { date: "2025-03-01", count: 1 },
    ]);
  });

  it("treats missing dates as zero in the other calendar", () => {
    const a = [
      { date: "2025-01-01", count: 10 },
      { date: "2025-01-02", count: 0 },
    ];
    const b = [{ date: "2025-01-02", count: 5 }];
    expect(mergeCalendars(a, b)).toEqual([
      { date: "2025-01-01", count: 10 },
      { date: "2025-01-02", count: 5 },
    ]);
  });
});
