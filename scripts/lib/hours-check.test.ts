import { describe, expect, it } from 'vitest';
import { hoursDifferences, hoursFromWeekdayText } from './hours-check';

const T = ' '; // Google puts thin spaces around the en dash
const N = ' '; // and a narrow no-break space before AM/PM

describe('hoursFromWeekdayText', () => {
  it('keys by day and leaves out closed days', () => {
    expect(
      hoursFromWeekdayText([
        `Monday: Closed`,
        `Tuesday: 4:00${T}–${T}10:00${N}PM`,
        `Saturday: 11:00${N}AM${T}–${T}1:00${N}AM`,
      ])
    ).toEqual({
      tuesday: `4:00${T}–${T}10:00${N}PM`,
      saturday: `11:00${N}AM${T}–${T}1:00${N}AM`,
    });
  });
});

describe('hoursDifferences', () => {
  it('ignores formatting and reports changed and closed days', () => {
    const stored = {
      tuesday: '4 – 10 PM',
      wednesday: '4:00 – 9:00 PM',
      thursday: '3:00 – 9:00 PM',
    };
    const google = {
      tuesday: `4:00${T}–${T}10:00${N}PM`,
      wednesday: `4:00${T}–${T}10:00${N}PM`,
      friday: '12:00 – 10:00 PM',
    };
    expect(hoursDifferences(stored, google).map((d) => d.day)).toEqual([
      'wednesday',
      'thursday',
      'friday',
    ]);
    expect(hoursDifferences(stored, google)[1]).toEqual({
      day: 'thursday',
      stored: '3:00 – 9:00 PM',
      google: 'Closed',
    });
  });

  it('matches split days in any order', () => {
    expect(
      hoursDifferences(
        { sunday: '5 – 9 PM, 11 AM – 2 PM' },
        { sunday: '11:00 AM – 2:00 PM, 5:00 – 9:00 PM' }
      )
    ).toEqual([]);
  });
});
