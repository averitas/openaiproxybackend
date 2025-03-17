'use client';

import * as React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
  styled,
  ButtonProps,
  alpha
} from '@mui/material';
import { cn } from '@udecode/cn';

// Create a custom backdrop style to apply via slotProps
const backdropStyles = {
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
};

// Component interfaces
export interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => {
  const handleClose = () => onOpenChange(false);
  
  return (
    <Dialog 
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      // Fix: Replace deprecated BackdropComponent with slotProps
      slotProps={{
        backdrop: {
          sx: backdropStyles
        }
      }}
      sx={{ zIndex: 50 }}
    >
      {children}
    </Dialog>
  );
};

// Fix: Use MUI's ButtonProps instead of non-existent React.ButtonProps
export const AlertDialogTrigger = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>((props, ref) => {
  return <Button ref={ref} {...props} />;
});
AlertDialogTrigger.displayName = 'AlertDialogTrigger';

// Content component with animations
export const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DialogContent>
>(({ className, children, ...props }, ref) => {
  return (
    <DialogContent
      ref={ref}
      className={cn(
        'grid w-full gap-4 p-6 shadow-lg',
        className
      )}
      sx={{
        maxWidth: '32rem',
        borderRadius: { xs: 0, sm: '0.5rem' },
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
      {...props}
    >
      {children}
    </DialogContent>
  );
});
AlertDialogContent.displayName = 'AlertDialogContent';

// Header component
export const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <Box
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

// Footer component
export const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <DialogActions
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

// Title component
export const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<typeof DialogTitle>
>(({ className, ...props }, ref) => (
  <DialogTitle
    ref={ref}
    className={cn('text-lg font-semibold', className)}
    {...props}
  />
));
AlertDialogTitle.displayName = 'AlertDialogTitle';

// Description component
export const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<typeof DialogContentText>
>(({ className, ...props }, ref) => (
  <DialogContentText
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
AlertDialogDescription.displayName = 'AlertDialogDescription';

// Action button component
export const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="contained"
    color="primary"
    size="medium"
    className={cn(className)}
    {...props}
  />
));
AlertDialogAction.displayName = 'AlertDialogAction';

// Cancel button component
export const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="outlined"
    color="inherit"
    size="medium"
    className={cn(
      'mt-2 sm:mt-0',
      className
    )}
    {...props}
  />
));
AlertDialogCancel.displayName = 'AlertDialogCancel';

// For compatibility with existing code - using regular div elements
export const AlertDialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/80', className)} 
    {...props} 
  />
));
AlertDialogOverlay.displayName = 'AlertDialogOverlay';

export const AlertDialogPortal = React.Fragment;
