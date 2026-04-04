package com.gigshield.service;

import java.time.DayOfWeek;
import java.time.LocalDate;

public final class WeekUtil {

    private WeekUtil() {
    }

    public static LocalDate weekStart(LocalDate today) {
        DayOfWeek dow = today.getDayOfWeek();
        int back = dow.getValue() - DayOfWeek.MONDAY.getValue();
        if (back < 0) {
            back += 7;
        }
        return today.minusDays(back);
    }

    public static LocalDate weekEnd(LocalDate start) {
        return start.plusDays(6);
    }
}
