import "./App.css";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AiTwotoneCalendar } from "react-icons/ai";
import { database } from "./firebase";
import { ref, push, onValue } from "firebase/database";
import axios from "axios";

function getWindowDimensions() {
	const { innerWidth: width, innerHeight: height } = window;
	return {
		width,
		height,
	};
}

function getNow() {
	let today = new Date();
	let year = today.getFullYear();
	let month = today.getMonth() + 1;
	let date = today.getDate();
	let hours = today.getHours();
	let minutes = today.getMinutes();
	let seconds = today.getSeconds();

	return (
		year +
		"/" +
		month +
		"/" +
		date +
		" " +
		hours +
		":" +
		minutes +
		":" +
		seconds
	);
}

function App() {
	const [time, setTime] = useState("");
	const [date, setDate] = useState(new Date("2021-12-17"));
	const [msg, setMsg] = useState("");
	const [ip, setIP] = useState("000.000.000.000");
	const [chats, setChats] = useState([]);
	const [windowDimensions, setWindowDimensions] = useState({
		width: 500,
		height: 500,
	});

	const handleOnChange = e => {
		setMsg(e.target.value);
	};

	const enter = e => {
		if (e.key === "Enter") {
			handleSumbit(e);
		}
	};

	const handleSumbit = async e => {
		e.preventDefault();
		try {
			await sendChat({
				message: msg,
				timestamp: getNow(),
				uid: ip,
			});
		} catch (error) {
			console.log(error);
		}
	};

	function sendChat(data) {
		if (msg.length > 0) {
			setMsg("");
			return push(ref(database, "chats"), {
				message: data.message,
				timestamp: data.timestamp,
				uid: data.uid,
			});
		}
	}

	const getIP = async () => {
		const res = await axios.get("https://geolocation-db.com/json/");
		setIP(res.data.IPv4);
	};

	function getDate() {
		if (localStorage.getItem("date") !== null) {
			setDate(new Date(localStorage.getItem("date")));
		}
	}

	function getTime() {
		var jongang = date;
		let today = new Date();
		let remain = Math.floor((jongang - today) / 1000);
		let d_days = Math.floor(remain / 86400);
		let d_hours = Math.floor((remain % 86400) / 3600);
		let d_mins = Math.floor(((remain % 86400) % 3600) / 60);
		let d_secs = Math.floor(((remain % 86400) % 3600) % 60);

		return (
			d_days + "일 " + d_hours + "시간 " + d_mins + "분 " + d_secs + "초 "
		);
	}

	useEffect(() => {
		getIP();
		try {
			onValue(ref(database, "chats"), snapshot => {
				if (snapshot.exists()) {
					setChats(Object.values(snapshot.val()).reverse());
				} else {
					console.log("No data available");
				}
			});
		} catch (error) {
			console.log(error);
		}
		setWindowDimensions(getWindowDimensions());
		function handleResize() {
			setWindowDimensions(getWindowDimensions());
		}
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		getDate();
		const countdown = setInterval(() => {
			setTime(getTime());
		}, 1000);
		return () => clearInterval(countdown);
	}, []);

	const CustomInput = ({ value, onClick }) => (
		<div style={{ display: "flex", alignItems: "center" }}>
			<div style={{ marginRight: "3px" }}>{value}</div>
			<AiTwotoneCalendar
				style={{ cursor: "pointer" }}
				onClick={onClick}
			/>
		</div>
	);

	return (
		<div>
			<div
				style={{
					textAlign: "end",
					fontSize: "small",
					color: "rgba(255, 255, 255, 0.5)",
					padding: "10px",
					cursor: "pointer",
				}}
				onClick={() => window.open("https://github.com/minr2kb")}
			>
				2021 (c) Kyungbae Min
			</div>
			<div className="App">
				<header
					style={{
						marginBottom: "3rem",
					}}
				>
					<h2
						style={{
							margin: "10px",
						}}
					>
						<span
							style={{
								padding: "10px",
								borderBottom: "solid 2px white",
							}}
						>
							종강 카운터
						</span>
					</h2>

					<h1
						style={{
							marginLeft: "20px",
							marginRight: "20px",
							marginTop: "4rem",
							marginBottom: "3rem",
						}}
					>
						<span>{getTime() + "\n"} </span>
						{windowDimensions.width > 500 ? (
							<span>남았습니다</span>
						) : (
							<div>남았습니다</div>
						)}
					</h1>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<div style={{ marginRight: "5px" }}>종강 날짜:</div>
						<div>
							<DatePicker
								dateFormat="yyyy-MM-dd"
								selected={date}
								onChange={date => {
									setDate(date);
									localStorage.setItem(
										"date",
										date.toString()
									);
								}}
								customInput={<CustomInput />}
							/>
						</div>
					</div>
					<div>IP 주소: {ip}</div>
				</header>
				<div
					style={{ display: windowDimensions.width > 500 && "flex" }}
				>
					<input
						className="input-field"
						style={{
							width:
								windowDimensions.width > 500 ? "40vw" : "80vw",
						}}
						onChange={handleOnChange}
						onKeyPress={enter}
						value={msg}
						placeholder="종강에게 한마디"
					/>
					<div
						className="button-submit"
						onClick={handleSumbit}
						style={{
							margin: windowDimensions.width <= 500 && 0,
							marginTop: windowDimensions.width <= 500 && "10px",
						}}
					>
						Send
					</div>
				</div>
				{/* <span style={{ fontSize: "medium" }}></span> */}
				<div style={{ marginTop: "20px", marginBottom: "50px" }}>
					{chats.map(chat => (
						<div
							className="chat-box"
							style={{
								width:
									windowDimensions.width > 700
										? "50vw"
										: "80vw",
							}}
							key={chat.timestamp}
						>
							<div
								style={{
									fontSize: "small",
									marginBottom: "5px",
								}}
							>
								{chat.timestamp} (
								{chat.uid.split(".").splice(-1)})
							</div>
							<div
								style={{ fontSize: "large", fontWeight: "500" }}
							>
								{chat.message}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default App;
