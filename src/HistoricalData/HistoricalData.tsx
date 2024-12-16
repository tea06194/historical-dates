import React, { useEffect, useRef, useState } from "react";

import { DateType, HistoricalDates } from "../data/data";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import TextPlugin from "gsap/TextPlugin";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper as SwiperType } from "swiper";

import arrowSlides from "../../public/icons/next.svg";
import prevPointArrow from "../../public/icons/prevPoint.svg";
import nextPointArrow from "../../public/icons/nextPoint.svg";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import * as styles from "./HistoricalData.module.scss";

// TODO: refactor decompose

gsap.registerPlugin(useGSAP, TextPlugin);

const HistoricalData: React.FC = () => {
    const [countPoints, setCountPoints] = useState<number>(6);
    const [rotation, setRotation] = useState<number>(0);
    const [prevActivePoint, setPrevActivePoint] = useState<number>(5);
    const [activePoint, setActivePoint] = useState<number>(5);
    const [currentDate, setCurrentDate] = useState<DateType>(
        HistoricalDates[activePoint],
    );
    const [windowSize, setWindowSize] = useState<number>(0);

    const pointsRef = useRef<HTMLDivElement>(null);

    const startRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    const swiperRef = useRef<SwiperType>(null);

    const calculatePoints = (countPoints: number, radius: number) => {
        const centerX = radius;
        const centerY = radius;

        return Array.from({ length: countPoints }, (_, i) => {
            const step = 360 / countPoints; // шаг угла
            const angle = i * step;
            const radians = (angle * Math.PI) / 180;

            const x = centerX + radius * Math.cos(radians);
            const y = centerY + radius * Math.sin(radians);

            return { x, y, angle };
        });
    };

    useGSAP(() => {
        gsap.fromTo(
            startRef.current,
            { text: `${HistoricalDates[prevActivePoint].start}` },
            {
                duration: 0.7,
                text: `${HistoricalDates[activePoint].start}`,
                ease: "strong.inOut",
            },
        );
        gsap.fromTo(
            endRef.current,
            { text: `${HistoricalDates[prevActivePoint].end}` },
            {
                duration: 0.7,
                text: `${HistoricalDates[activePoint].end}`,
                ease: "strong.inOut",
            },
        );
    }, [currentDate]);

    useEffect(() => {
        setWindowSize(window.screen.width);
    });

    useEffect(() => {
        if (!pointsRef.current) return;

        const radius = pointsRef.current.offsetWidth / 2;
        const points = calculatePoints(countPoints, radius);

        const pointElements = pointsRef.current.querySelectorAll(
            `.${styles.point}`,
        );
        points.forEach((point, index) => {
            const pointElement = pointElements[index] as HTMLElement;
            if (pointElement) {
                pointElement.style.left = `${point.x}px`;
                pointElement.style.top = `${point.y}px`;
                pointElement.dataset.angle = `${point.angle}`;
            }
        });

        const lastPointAngle = points[points.length - 1]?.angle || 0;
        const initialRotation = 360 - lastPointAngle - 45;
        setRotation(initialRotation);
    }, [countPoints]);

    useEffect(() => {
        setCurrentDate(HistoricalDates[activePoint]);
    }, [activePoint]);

    const handlePointClick = (angle: number, index: number) => {
        setRotation(360 - angle - 45);
        setPrevActivePoint(activePoint);
        setActivePoint(index);

        if (swiperRef.current) {
            swiperRef.current.slideTo(0);
        }
    };

    const [isAtStart, setIsAtStart] = useState<boolean>(true);
    const [isAtEnd, setIsAtEnd] = useState<boolean>(false);

    const handleSlideChange = (swiper: SwiperType) => {
        setIsAtStart(swiper.isBeginning);
        setIsAtEnd(swiper.isEnd);
    };

    const handleRotateToPoint = (index: number) => {
        if (!pointsRef.current) {
            return;
        }

        const pointElement = pointsRef.current.querySelectorAll(
            `.${styles.point}`,
        )[index] as HTMLElement;

        const angle = parseFloat(pointElement?.dataset.angle || "0");
        setRotation(360 - angle - 45);
        setActivePoint(index);
    };

    const handlePrev = () => {
        if (activePoint > 0) {
            handleRotateToPoint(activePoint - 1);
        }
    };
    const handleNext = () => {
        if (activePoint < countPoints - 1) {
            handleRotateToPoint(activePoint + 1);
        }
    };

    const pagination = {
        clickable: true,
        el: `.${styles["swiper-pagination"]}`,
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>
                <div className={styles["header-text"]}>
                    <span>Исторические </span>
                    <span>даты</span>
                </div>
            </h1>
            <div className={styles["circle-wrapper"]}>
                <div className={styles["horizontal-line"]}></div>
                <div className={styles["vertical-line"]}></div>
                <div className={styles.circle}></div>
                <div
                    className={styles.points}
                    ref={pointsRef}
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {Array.from({ length: countPoints }).map((_, index) => (
                        <div
                            key={index}
                            className={`${styles.point}${activePoint === index ? ` ${styles.active}` : ""}`}
                            onClick={(e) => {
                                const angle = parseFloat(
                                    (e.currentTarget as HTMLElement).dataset
                                        .angle || "0",
                                );
                                handlePointClick(angle, index);
                            }}
                        >
                            <span
                                style={{ transform: `rotate(${-rotation}deg)` }}
                            >
                                {index + 1}
                            </span>
                        </div>
                    ))}
                </div>
                <div className={styles.years}>
                    <div
                        className={styles["years__start"]}
                        ref={startRef}
                    ></div>
                    <div className={styles["years__end"]} ref={endRef}></div>
                </div>
                <div className={styles.controls}>
                    <span className={styles.counter}>
                        {`0${activePoint + 1}/0${countPoints}`}
                    </span>
                    <div className={styles["controls-wrapper"]}>
                        <button
                            className={styles["control-button"]}
                            onClick={handlePrev}
                            disabled={activePoint === 0}
                        >
                            <img src={prevPointArrow} />
                        </button>
                        <button
                            className={styles["control-button"]}
                            onClick={handleNext}
                            disabled={activePoint === countPoints - 1}
                        >
                            <img src={nextPointArrow} />
                        </button>
                    </div>
                </div>
            </div>
            <div className={styles["swiper-container"]}>
                <Swiper
                    className={styles.swiper}
                    spaceBetween={windowSize >= 1024 ? 80 : 25}
                    slidesPerView={windowSize >= 1024 ? 3 : "auto"}
                    onSlideChange={handleSlideChange}
                    modules={[Navigation, Pagination]}
                    pagination={windowSize < 1024 ? pagination : false}
                    grabCursor={true}
                    onBeforeInit={(swiper) => {
                        swiperRef.current = swiper;
                        setIsAtStart(swiper.isBeginning);
                        setIsAtEnd(swiper.isEnd);
                    }}
                >
                    {HistoricalDates[activePoint].slides.map((slide) => {
                        return (
                            <SwiperSlide
                                className={styles["swiper-slide"]}
                                key={`${slide.date}-${crypto.randomUUID()}`}
                            >
                                <h2 className={styles["swiper-slide__header"]}>
                                    {slide.date}
                                </h2>
                                <p className={styles["swiper-slide__content"]}>
                                    {slide.content}
                                </p>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
                <button
                    className={`${styles["swiper-button"]} ${styles["swiper-button_prev"]}`}
                    onClick={() => swiperRef.current?.slidePrev()}
                    style={{
                        display:
                            isAtStart || windowSize < 1024 ? "none" : "block",
                    }}
                >
                    <img src={arrowSlides} />
                </button>
                <button
                    className={`${styles["swiper-button"]} ${styles["swiper-button_next"]}`}
                    onClick={() => swiperRef.current?.slideNext()}
                    style={{
                        display:
                            isAtEnd || windowSize < 1024 ? "none" : "block",
                    }}
                >
                    <img src={arrowSlides} />
                </button>
                {windowSize < 1024 ? (
                    <div className={styles["swiper-pagination"]}></div>
                ) : null}
            </div>
            <div className={styles["count-control"]}>
                <label>
                    Количество точек:{" "}
                    <select
                        value={countPoints}
                        onChange={(e) => (
                            setCountPoints(Number(e.target.value)),
                            setActivePoint(Number(e.target.value) - 1)
                        )}
                    >
                        {[1, 2, 3, 4, 5, 6].map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </div>
    );
};

export default HistoricalData;
