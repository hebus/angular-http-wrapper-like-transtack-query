import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  EMPTY,
  from,
  Observable,
  ObservableInput,
  ReplaySubject,
  share,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';

export type QueryStatus = 'initial' | 'pending' | 'success' | 'error';

export interface Query<T = any> {
  data$: Observable<T>;
  error$: Observable<any>;
  status$: Observable<QueryStatus>;
  invalidate: () => void;
}

export function query<T>(fn: () => ObservableInput<T>): Query<T> {
  const run$ = new Subject<void>();
  const status$ = new BehaviorSubject<QueryStatus>('initial');
  const error$ = new BehaviorSubject<any>(null);

  const data$ = run$.pipe(
    // start fetching as soon as we subscribe to data$
    startWith(undefined),
    // set the status to "pending" with every request
    tap(() => status$.next('pending')),
    // throw away pending requests
    // you could also consider "exhaustMap" for different flavor!
    switchMap(() =>
      from(fn()).pipe(
        // set status and error
        tap({
          next: () => {
            status$.next('success');
            error$.next(null);
          },
          error: (e) => {
            status$.next('error');
            error$.next(e);
          },
        }),
        // prevent the stream from crashing
        catchError(() => EMPTY)
      )
    ),
    // share a single stream with multiple observers
    share({
      connector: () => new ReplaySubject(1),
      resetOnComplete: false,
      resetOnError: false,
      resetOnRefCountZero: false,
    })
  );

  return {
    invalidate: () => run$.next(),
    status$: status$.pipe(distinctUntilChanged()),
    error$: error$.asObservable(),
    data$,
  };
}
