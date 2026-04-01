import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { aeroColors } from '../theme';

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'error' | 'primary' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = 'Potwierdzenie',
  message,
  confirmLabel = 'Potwierdz',
  cancelLabel = 'Anuluj',
  confirmColor = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      PaperProps={{
        sx: {
          bgcolor: aeroColors.surfaceContainer,
          color: aeroColors.onSurface,
          borderRadius: 2,
          border: `1px solid ${aeroColors.outlineVariant}`,
          minWidth: 360,
        },
      }}
    >
      <DialogTitle
        id="confirm-dialog-title"
        sx={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 600,
          fontSize: '1.125rem',
          color: aeroColors.onSurface,
          pb: 1,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          id="confirm-dialog-description"
          sx={{ color: aeroColors.onSurfaceVariant, fontSize: '0.875rem' }}
        >
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          variant="text"
          onClick={onCancel}
          sx={{ color: aeroColors.onSurfaceVariant }}
        >
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          autoFocus
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
