import { useState, useEffect, useRef } from "react";

// https://mixkit.co/free-sound-effects/game/
import tapFX from "./assets/sounds/tap.mp3";
import looseFX from "./assets/sounds/loose.mp3";

import "./assets/css/snake.css";

export default function Snake() {
    const DELAY = 200;

    // const gridSize = 144; // 12x12
    const gridSize = 324; // 18x18
    // const gridSize = 1296; // 36x36

    const randomCase = () => { return Math.round(Math.random() * gridSize); };
    const randomFoodCase = () => { return Math.round(Math.random() * (gridSize / 2 - 1) + (gridSize / 2 - 1)); };
    const randomHeadCase = () => { return Math.round(Math.random() * (gridSize / 2 - 1)) };

    const gridArray = [];
    for (let i = 0; i < gridSize; i++) {
        gridArray.push(i);
    }

    let sqrt = Math.sqrt(gridSize);

    const WEST = -1;
    const EAST = 1;
    const NORTH = -sqrt;
    const SOUTH = sqrt;

    const [step, setStep] = useState(EAST);

    const _left_key = 37;
    const _up_key = 38;
    const _right_key = 39;
    const _down_key = 40;

    const borderTop = computeBorderTop();
    const borderLeft = compuputeBorderLeft();
    const borderRight = computeBorderRight();
    const borderBottom = computeBorderBottom();

    function computeBorderTop() { let a = []; for (let i = 0; i < sqrt; i++) { a.push(i); } return a; }
    function compuputeBorderLeft() { let a = []; const _max = gridSize - sqrt; for (let i = 0; i <= _max; i += sqrt) { a.push(i) } return a; }
    function computeBorderRight() { let a = []; for (let i = sqrt - 1; i < gridSize; i += sqrt) { a.push(i) } return a; }
    function computeBorderBottom() { let a = []; for (let i = gridSize - sqrt; i < gridSize; i++) { a.push(i) } return a; }

    const soundFood = new Audio(tapFX);
    const soundLoose = new Audio(looseFX);

    const [isPaused, setPause] = useState(false);
    const [snake, setSnake] = useState([randomHeadCase()]);  // initialized at half top
    const [delay, setDelay] = useState(DELAY);
    const [isLost, setIsLost] = useState(false);
    const [isTurtle, setIsTurtle] = useState(false);
    const [isRabbit, setIsRabbit] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    // Food location
    const [food, setFood] = useState(randomFoodCase());  // initialized at half bottom

    /**
     * From Dan Abramov @ 
     * https://overreacted.io/making-setinterval-declarative-with-react-hooks/
     */
    function useInterval(callback, delay) {
        const savedCallback = useRef();

        // Remember the latest function.
        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);

        // Set up the interval.
        useEffect(() => {
            function tick() {
                savedCallback.current();
            }
            if (delay !== null) {
                let id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    }

    useInterval(() => {
        let array = [];

        if (snake.length > 1) {
            if (snake.length === 2) {
                array.push(snake[0]);
            }
            else {
                array = snake.slice(0, snake.length - 1);
            }
        }

        // we move the head
        let p = movePoint(snake[0], step);

        // Loose case
        if (snake.includes(p)) {
            soundLoose.play();
            setIsLost(true);
        }

        array.unshift(p);

        // Food case
        if (array[0] === food) {
            soundFood.play();

            array.unshift(food);

            let n;

            do {
                n = randomCase();
            }
            while (array.includes(n))

            setFood(() => n);
        }

        setSnake(() => array);

    }, isLost ? null : !isPaused ? delay : null);

    function movePoint(point, direction) {
        if (step === SOUTH) {  // direction south
            if (borderBottom.includes(point) === true) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                point = sqrt - (gridSize - point);
            }
            else {
                point += direction;
            }
        }
        else if (step === NORTH) {  // direction north
            if (borderTop.includes(point) === true) {
                point = (point + gridSize) - sqrt;
            }
            else {
                point += direction;
            }
        }
        else if (step === WEST) { // direction west
            if (borderLeft.includes(point) === true) {
                point = point + sqrt - 1;
            }
            else {
                point += direction;
            }
        }
        else if (step === EAST) { // direction east
            if (borderRight.includes(point) === true) {
                point = point - sqrt + 1;
            }
            else {
                point += direction;
            }
        }

        return point;
    }

    useEffect(() => {
        document.addEventListener("keydown", checkKey);
    }, [])

    function checkKey(e) {

        if (e.keyCode === _left_key) {
            setStep(() => WEST);
        }
        else if (e.keyCode === _right_key) {
            setStep(() => EAST);
        }
        else if (e.keyCode === _up_key) {
            setStep(() => NORTH);
        }
        else if (e.keyCode === _down_key) {
            setStep(() => SOUTH);
        }
    }

    function stepToString() {
        if (step === WEST) { return "WEST" }
        else if (step === EAST) { return "EAST" }
        else if (step === NORTH) { return "NORTH" }
        else if (step === SOUTH) { return "SOUTH" }

        return "ERROR";
    }

    function reset() {
        let newFood, newSnake;
        newFood = randomFoodCase();
        newSnake = randomHeadCase();
        setFood(() => newFood);
        setSnake(() => [newSnake]);
        setIsLost(() => false);
        setPause(() => false);
        setStep(() => EAST);
    }

    function changeSpeed(e) {
        if (e === "turtle") {
            if (isTurtle === false) {
                setIsTurtle(d => true);
                setDelay(d => 500);
            }
            else {
                setIsTurtle(d => false);
                setDelay(d => DELAY);
            }

            if (isRabbit === true) {
                setIsRabbit(d => false);
            }
        }
        else if (e === "rabbit") {
            if (isRabbit === false) {
                setIsRabbit(d => true);
                setDelay(d => DELAY / 2);
            }
            else {
                setIsRabbit(d => false);
                setDelay(d => DELAY);
            }

            if (isTurtle === true) {
                setIsTurtle(d => false);
            }
        }
    }

    const _snakeSVG = <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 47.5 47.5" viewBox="0 0 47.5 47.5"><defs><clipPath id="a" clipPathUnits="userSpaceOnUse"><path d="M 0,38 38,38 38,0 0,0 0,38 Z" /></clipPath></defs><g clip-path="url(#a)" transform="matrix(1.25 0 0 -1.25 0 47.5)"><path fill="#dd2e44" d="m 0,0 c -0.719,0 -2.295,-2.243 -3.567,-1.029 -0.44,0.42 1.817,1.279 1.727,2.017 -0.076,0.608 -2.843,1.52 -1.876,2.099 0.967,0.578 2.418,-0.841 3.513,-0.866 C 2.179,2.167 4.009,3.074 4.035,3.087 4.576,3.361 5.23,3.139 5.499,2.591 5.769,2.044 5.55,1.378 5.011,1.105 4.881,1.039 2.786,0 0,0" transform="translate(12.84 29.366)" /><path fill="#77b255" d="m 0,0 c -3.967,0 -8.182,2.912 -8.182,8.308 0,1.374 -0.889,1.661 -1.636,1.661 -0.746,0 -1.637,-0.287 -1.637,-1.661 0,-5.396 -4.215,-8.308 -8.182,-8.308 -3.966,0 -8.181,2.77 -8.181,8.308 0,13.292 14.181,15.127 14.181,13.292 0,-1.835 -7.636,1.108 -7.636,-12.185 0,-2.215 0.89,-2.769 1.636,-2.769 0.747,0 1.637,0.288 1.637,1.662 0,5.395 4.215,8.307 8.182,8.307 3.965,0 8.181,-2.912 8.181,-8.307 0,-1.374 0.89,-1.662 1.637,-1.662 0.747,0 1.636,0.288 1.636,1.662 l 0,16.615 c 0,3.855 -3.417,4.431 -5.454,4.431 0,0 -3.273,-1.108 -6.546,-1.108 -3.273,0 -4.364,2.596 -4.364,4.431 0,1.835 4.364,3.323 10.91,3.323 6.546,0 12,-4.451 12,-11.077 l 0,-16.615 C 8.182,2.912 3.966,0 0,0" transform="translate(28.818 1)" /><path fill="#292f33" d="m 0,0 c 0,-0.552 -0.447,-1 -1,-1 -0.553,0 -1,0.448 -1,1 0,0.552 0.447,1 1,1 0.553,0 1,-0.448 1,-1" transform="translate(21 34)" /></g></svg>
    const _helpSVG = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.29,15.29a1.58,1.58,0,0,0-.12.15.76.76,0,0,0-.09.18.64.64,0,0,0-.06.18,1.36,1.36,0,0,0,0,.2.84.84,0,0,0,.08.38.9.9,0,0,0,.54.54.94.94,0,0,0,.76,0,.9.9,0,0,0,.54-.54A1,1,0,0,0,13,16a1,1,0,0,0-.29-.71A1,1,0,0,0,11.29,15.29ZM12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM12,7A3,3,0,0,0,9.4,8.5a1,1,0,1,0,1.73,1A1,1,0,0,1,12,9a1,1,0,0,1,0,2,1,1,0,0,0-1,1v1a1,1,0,0,0,2,0v-.18A3,3,0,0,0,12,7Z" /></svg>;
    const _closeSVG = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>;
    const _snakeHeadSVG = <div className="snake-head"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#a0c432" d="M38.69,43H26a10,10,0,0,1-9.39-6.58L11.92,23.53A15.24,15.24,0,0,1,11,18.3h0A15.3,15.3,0,0,1,26.3,3H37.7A15.3,15.3,0,0,1,53,18.3v.32a15.19,15.19,0,0,1-.72,4.64L48.22,36A10,10,0,0,1,38.69,43Z"/><circle cx="43.5" cy="20.5" r="1.5" fill="#2d2d2d"/><circle cx="20.5" cy="20.5" r="1.5" fill="#2d2d2d"/><path fill="#e71b3f" d="M38,61l-6-4-6,4h0a15,15,0,0,0,3-9V43h6v9a15,15,0,0,0,3,9Z"/><path fill="#586c1c" d="M24 40a1 1 0 0 1-.71-.29l-1-1a1 1 0 0 1 1.42-1.42l1 1a1 1 0 0 1 0 1.42A1 1 0 0 1 24 40zM40 40a1 1 0 0 1-.71-.29 1 1 0 0 1 0-1.42l1-1a1 1 0 0 1 1.42 1.42l-1 1A1 1 0 0 1 40 40z"/></svg></div>;

    return (
        <div className="snake-pagecontainer">
            {help()}
            <div className="snake-title">
                <h1>Snake</h1>
                <div className="snake-logo">{_snakeSVG}</div>
            </div>
            {/* {debug()} */}
            <div className="snake-maincontainer">
                {buttons()}
                {computeSnakeGrid()}
            </div>
            <div className="snake-commands">
                {commands()}
            </div>
        </div>
    )

    function help() {
        return <>
            <div className="snake-help-icon" onClick={() => {setShowHelp(() => true); setPause(()=>true) }}>{_helpSVG}</div>
            <div className="snake-help-popup" style={{ height: `${showHelp ? "100vh" : "0px"}` }}>
                <div className="snake-close" onClick={() => setShowHelp(() => false)}>{_closeSVG}</div>
                <h2>How to play?</h2>
                <h3>Desktop</h3>
                <h4>use keyboard</h4>
                <div>⬆️</div>
                <div>⬅️⬇️➡️</div>
                <h3 className="snake-help-mobiletitle">Mobile</h3>
                <h4>Tap on virtual pad</h4>
                <div className="snake-command-up"></div>
                <div className="snake-help-row">
                    <div className="snake-command-left"></div>
                    <div className="snake-help-filler"></div>
                    <div className="snake-command-right"></div>
                </div>
                <div className="snake-command-down"></div>
            </div>
        </>
    }

    function debug() {
        return <div className="snake-debug">
            <div>Debug</div> 
            <div>Snake Size: {snake.length}</div>
            <div>Direction: {stepToString()}</div>
            <div>Food: {food}</div>
            <div>Pause: {isPaused ? "ON" : "OFF"}</div>
            {/* <h3>Selected cases: {snake.toString()}</h3> */}
        </div>;
    }

    function computeSnakeGrid() {
        return <div className="snake-grid">
            {popup()}
            {gridArray.map((e, i) => {
                return <div className="snake-case">
                <div
                    className={
                        snake.includes(i) && i!==snake[0]? "snake-case snake-case-selected" :
                            food === i ? "snake-case snake-case-food" : ""
                    }>
                        {i=== food ? "🍎" : null}
                        {i=== snake[0] ? <div className={step===EAST? "snake-head-east" : step===WEST ? "snake-head-west" : step===NORTH ? "snake-head-north" : ""}>{_snakeHeadSVG}</div> : null }
                    {/* {i} */}
                </div>
                </div>
            })}
        </div>
    }

    function buttons() {
        const _turtleSVG = <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 47.5 47.5" viewBox="0 0 47.5 47.5"><defs><clipPath id="a" clipPathUnits="userSpaceOnUse"><path d="M 0,38 38,38 38,0 0,0 0,38 Z" /></clipPath></defs><g clip-path="url(#a)" transform="matrix(1.25 0 0 -1.25 0 47.5)"><path fill="#77b255" d="m 0,0 c 0,-9.842 6.575,-9.673 5.158,-10.078 -7,-2 -8.804,7.618 -9.464,7.618 -2.378,0 -5.536,0.423 -5.536,2.46 0,2.039 2.46,4.922 6.151,4.922 C -1.312,4.922 0,2.039 0,0" transform="translate(10.842 17.078)" /><path fill="#77b255" d="m 0,0 c 0,-1.104 -3.518,0.741 -5,0 -2,-1 -2,0.896 -2,2 0,1.104 1.343,1 3,1 1.657,0 4,-1.896 4,-3" transform="translate(37 8.362)" /><path fill="#77b255" d="m 0,0 c 0,-2.761 -1.279,-2.857 -2.857,-2.857 -1.579,0 -2.858,0.096 -2.858,2.857 0,0.489 0.085,1.029 0.234,1.587 0.69,2.59 2.754,5.556 4.052,5.556 C 0.149,7.143 0,2.761 0,0" transform="translate(17.715 3.857)" /><path fill="#77b255" d="m 0,0 c 0,-2.761 1.278,-2.857 2.856,-2.857 1.579,0 2.858,0.096 2.858,2.857 0,0.489 -0.085,1.029 -0.235,1.587 C 4.789,4.177 2.726,7.143 1.428,7.143 -0.15,7.143 0,2.761 0,0" transform="translate(26.286 3.857)" /><path fill="#3e721d" d="m 0,0 c 0,-4 -5.149,-4 -11.5,-4 -6.351,0 -11.5,0 -11.5,4 0,6.627 5.149,12 11.5,12 C -5.149,12 0,6.627 0,0" transform="translate(33 10)" /><path fill="#292f33" d="m 0,0 c 0,-0.553 -0.448,-1 -1,-1 -0.552,0 -1,0.447 -1,1 0,0.553 0.448,1 1,1 0.552,0 1,-0.447 1,-1" transform="translate(7 19)" /><path fill="#5c913b" d="m 0,0 c 0,-3.591 -1.418,-3.9 -3.167,-3.9 -1.749,0 -3.166,0.309 -3.166,3.9 0,3.59 1.417,8.1 3.166,8.1 C -1.418,8.1 0,3.59 0,0" transform="translate(24.667 11.9)" /><path fill="#5c913b" d="m 0,0 c 0.871,-3.482 -0.784,-4 -2.533,-4 -1.749,0 -2.533,-0.69 -2.533,2.9 0,3.59 -1.117,6.5 0.632,6.5 C -2.685,5.4 -1,4 0,0" transform="translate(31 13)" /><path fill="#5c913b" d="m 0,0 c 0,-3.591 -0.785,-2.9 -2.534,-2.9 -1.749,0 -3.403,0.517 -2.533,4 1,4 3.251,5.4 5,5.4 C 1.683,6.5 0,3.59 0,0" transform="translate(17.067 11.9)" /></g></svg>;
        const _rabbitSVG = <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 47.5 47.5" viewBox="0 0 47.5 47.5"><defs><clipPath id="a" clipPathUnits="userSpaceOnUse"><path d="M 0,38 38,38 38,0 0,0 0,38 Z" /></clipPath></defs><g clip-path="url(#a)" transform="matrix(1.25 0 0 -1.25 0 47.5)"><path fill="#99aab5" d="M 0,0 C 0,4.142 -2,11 -1,11 0,11 6,7 4,0 2.862,-3.983 3.104,-4 2,-4 0.896,-4 0,-4.142 0,0" transform="translate(10 26)" /><path fill="#f4abba" d="M 0,0 C 0,3.414 -1.297,9.065 -0.648,9.065 0,9.065 3.89,5.769 2.593,0 1.855,-3.282 2.013,-3.296 1.296,-3.296 0.58,-3.296 0,-3.414 0,0" transform="translate(10.55 25.296)" /><path fill="#99aab5" d="M 0,0 C -1.062,4.003 -4.755,10.119 -3.789,10.375 -2.822,10.632 4.003,8.305 3.866,1.026 3.789,-3.115 4.027,-3.07 2.959,-3.353 1.892,-3.636 1.062,-4.003 0,0" transform="translate(5.789 24.625)" /><path fill="#f4abba" d="M 0,0 C -0.876,3.299 -3.579,8.429 -2.953,8.595 -2.326,8.762 2.279,6.573 2.506,0.665 2.635,-2.696 2.791,-2.67 2.099,-2.854 1.406,-3.037 0.876,-3.299 0,0" transform="translate(6.5 24.086)" /><path fill="#ccd6dd" d="M 0,0 C 0,-1.933 -1.567,-3.5 -3.5,-3.5 -5.433,-3.5 -7,-1.933 -7,0 -7,1.933 -5.433,3.5 -3.5,3.5 -1.567,3.5 0,1.933 0,0" transform="translate(37 8.5)" /><path fill="#99aab5" d="m 0,0 c 1.493,1.383 2.267,3.519 2.267,6.736 0,7.18 -6.821,11 -14,11 -2.058,0 -3.829,-0.157 -5.324,-0.539 -1.085,1.13 -2.859,1.539 -5.276,1.539 -4.265,0 -8.4,-4.069 -8.4,-8.333 0,-4.13 3.88,-4.636 7.998,-4.664 l 0.002,-0.003 c 3,-5 1,-10 3,-10 1.588,0 1.914,2.217 1.981,4.375 1.068,-0.663 2.258,-1.191 3.531,-1.577 -0.878,-0.523 -1.512,-1.068 -1.512,-1.298 0,-1.381 2,-1.5 5,-1.5 5.522,0 13,0 11,4 C 0.213,-0.156 0.115,-0.073 0,0" transform="translate(31.733 5.264)" /><path fill="#292f33" d="m 0,0 c 0,-0.553 -0.448,-1 -1,-1 -0.552,0 -1,0.447 -1,1 0,0.552 0.448,1 1,1 0.552,0 1,-0.448 1,-1" transform="translate(8 19)" /><path fill="#f4abba" d="m 0,0 c 0,-1.104 -0.5,-2 -1,-2 -0.5,0 -1,0.896 -1,2 0,1.104 0.448,1 1,1 0.552,0 1,0.104 1,-1" transform="translate(3 16)" /></g></svg>;
        const _pauseSVG = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8 5C6.89543 5 6 5.89543 6 7V17C6 18.1046 6.89543 19 8 19 9.10457 19 10 18.1046 10 17V7C10 5.89543 9.10457 5 8 5zM16 5C14.8954 5 14 5.89543 14 7V17C14 18.1046 14.8954 19 16 19 17.1046 19 18 18.1046 18 17V7C18 5.89543 17.1046 5 16 5z" /></svg>;
        const _playSVG = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><path d="M12 39c-.549 0-1.095-.15-1.578-.447A3.008 3.008 0 0 1 9 36V12c0-1.041.54-2.007 1.422-2.553a3.014 3.014 0 0 1 2.919-.132l24 12a3.003 3.003 0 0 1 0 5.37l-24 12c-.42.21-.885.315-1.341.315z" /></svg>;

        return <div className="snake-buttons">
            <div className="snake-speed-buttons">
                <div className={isTurtle ? "snake-turtle-button snake-speed-selected" : "snake-turtle-button"} onClick={() => changeSpeed("turtle")} id="turtle">{_turtleSVG}</div>
                <div className={isRabbit ? "snake-rabbit-button snake-speed-selected" : "snake-rabbit-button"} onClick={() => changeSpeed("rabbit")} id="rabbit">{_rabbitSVG}</div>
            </div>
            <button onClick={reset} className="snake-reset-button">new game</button>
            <div className="snake-pauseplay">
                <div style={{ display: `${isPaused ? "none" : "block"}` }} onClick={() => setPause(d => !d)}>{_pauseSVG}</div>
                <div style={{ display: `${isPaused ? "block" : "none"}` }} onClick={() => setPause(d => !d)}>{_playSVG}</div>
            </div>
            {/* <button className="snake-pausebutton" onClick={() => { setPause(!isPaused) }}>pause</button> */}
        </div>
    }

    function popup() {
        return <div className="snake-popup" style={{ display: `${isLost ? "flex" : "none"}` }}>
            <div><h2>Lost!</h2></div>
        </div>
    }

    function commands() {
        return <>
            <div className="snake-command-up" onClick={() => checkKey({ keyCode: _up_key })}></div>
            <div className="snake-commands-row">
                <div className="snake-command-left" onClick={() => checkKey({ keyCode: _left_key })}></div>
                <div></div>
                <div className="snake-command-right" onClick={() => checkKey({ keyCode: _right_key })}></div>
            </div>
            <div className="snake-command-down" onClick={() => checkKey({ keyCode: _down_key })}></div>
        </>
    }
}
