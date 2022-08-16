import React, { useEffect, useState } from "react";
import {
    map,
    of,
    distinctUntilChanged,
    switchMap,
    animationFrameScheduler,
    repeat,
    withLatestFrom,
    take,
    filter,
    scan
} from "rxjs";
import {pluckFirst, useObservableState, useObservable} from "observable-hooks";

// onTimerElapsed (onWorkTimer reached zero)
// onTimerDecrement
// onTimerStart (restart as well)
// onTimerIncrement (extend window)
// onTimerWarning (e.g. 5 min left)
// onPauseTimer
// onResumeTimer

// Work timer, rest timer

// interval 1000s
//

const WORK_SECONDS = 5 + 1;

const timerState = ["reset", "running", "paused"];

const Timer = () => {
    const [timerState] = useState("running");
    // const [secRemaining, setSecRemaining] = useState(WORK_WINDOW_SEC);
    // useTimer(() => setSecRemaining(secRemaining - 1));
    // pass timerState as a dependency array. When it changes it will emit a new item on the observable.
    const timerState$ = useObservable(pluckFirst, [timerState]);
    // subscribe to the change in the timerState observable
    const timerTick$ = useObservable(() =>
        timerState$.pipe(
            map(timerState => timerState === "reset"),
            // true or false. Only when toggled.
            distinctUntilChanged(),
            switchMap(isResetState =>
                isResetState
                    ? of(WORK_SECONDS)
                    : of(animationFrameScheduler.now(), animationFrameScheduler).pipe(
                        // Yield an observable that resubscribes to the source stream when the source stream completes
                        repeat(),
                        map(startTime => ~~((Date.now() - startTime) / 1000)),
                        // tick per 1000 ms (1 sec)
                        distinctUntilChanged(),
                        // grab the observable to implement pause logic
                        withLatestFrom(timerState$),
                        // continue only if the timer is running
                        filter(([, timerState]) => timerState === "running"),
                        // Take the amount of items specified. If below the take, go to next item. Otherwise, complete the Observable
                        take(WORK_SECONDS),
                        // If we got here, calculate how many seconds left
                        scan(timeLeft => timeLeft - 1, WORK_SECONDS)
                    )
            )
        )
    );
    const secRemaining = useObservableState(timerTick$, WORK_SECONDS);
    return (
        <>
            <h1>Pomodoro Timer</h1>
            <p>Time remaining: {secRemaining}</p>
            {secRemaining === 0 && <p>Time to rest!</p>}
        </>
    );
};

Timer.defaultProps = {};
Timer.propTypes = {};

export default Timer;
