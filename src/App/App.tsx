import React, { JSX } from "react";
import HistoricalData from "../HistoricalData/HistoricalData";
import * as styles from "./App.module.scss";

const App: React.FC = (): JSX.Element => {
	return (
		<div className={styles.app}>
			<HistoricalData />
			<div
				style={{
					width: "300px",
					height: "300px",
					backgroundColor: "red",
				}}
			>
				test square
			</div>
		</div>
	);
};

export default App;
