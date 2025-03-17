'use client';

import * as React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { styled } from '@mui/material/styles';

import { cn } from '@udecode/cn';

// Styled DateCalendar component with custom styling
const StyledCalendar = styled(DateCalendar)(({ theme }) => ({
  padding: '12px',
  '& .MuiPickersDay-root': {
    margin: '2px',
    height: '36px',
    width: '36px',
  },
  '& .MuiDayCalendar-header': {
    display: 'flex',
  },
  '& .MuiDayCalendar-weekDayLabel': {
    width: '36px', 
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
  },
  '& .Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    '&:focus': {
      backgroundColor: theme.palette.primary.dark,
    }
  },
  '& .MuiPickersDay-today': {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.text.primary,
  },
}));

export type CalendarProps = Partial<React.ComponentProps<typeof DateCalendar>> & {
  className?: string;
  showOutsideDays?: boolean;
};

function Calendar({
  className,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledCalendar
        className={cn(className)}
        showDaysOutsideCurrentMonth={showOutsideDays}
        {...props}
      />
    </LocalizationProvider>
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
