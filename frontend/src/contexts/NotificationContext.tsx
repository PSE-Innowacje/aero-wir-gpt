import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import type { AlertColor } from '@mui/material/Alert';
import {
  notificationEmitter,
  type NotificationEvent,
} from '../utils/notificationEmitter';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Notification {
  id: number;
  type: AlertColor;
  message: string;
}

interface NotificationContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const NotificationContext = createContext<NotificationContextValue | null>(null);

let nextId = 0;

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Notification[]>([]);
  const [current, setCurrent] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);

  // When the queue changes and nothing is showing, pop the next item.
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((prev) => prev.slice(1));
      setOpen(true);
    }
  }, [current, queue]);

  const enqueue = useCallback((type: AlertColor, message: string) => {
    setQueue((prev) => [...prev, { id: nextId++, type, message }]);
  }, []);

  const showSuccess = useCallback(
    (message: string) => enqueue('success', message),
    [enqueue],
  );

  const showError = useCallback(
    (message: string) => enqueue('error', message),
    [enqueue],
  );

  const showWarning = useCallback(
    (message: string) => enqueue('warning', message),
    [enqueue],
  );

  // Subscribe to the non-React emitter so Axios interceptors can push
  // notifications without holding a reference to the React context.
  useEffect(() => {
    const handler = (event: NotificationEvent) => {
      enqueue(event.type, event.message);
    };
    notificationEmitter.subscribe(handler);
    return () => notificationEmitter.unsubscribe(handler);
  }, [enqueue]);

  const handleClose = useCallback(
    (_event?: React.SyntheticEvent | Event, reason?: string) => {
      // Do not dismiss on clickaway so the user has time to read.
      if (reason === 'clickaway') return;
      setOpen(false);
    },
    [],
  );

  const handleExited = useCallback(() => {
    setCurrent(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ showSuccess, showError, showWarning }}
    >
      {children}

      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        TransitionProps={{ onExited: handleExited }}
      >
        {current ? (
          <Alert
            onClose={handleClose}
            severity={current.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {current.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotificationContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      'useNotification must be used within NotificationProvider',
    );
  }
  return ctx;
}
