import "./App.css";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AiTwotoneCalendar, AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { database } from "./firebase";
import { ref, push, onValue, update } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";
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
	const [uid, setUid] = useState("");
	const [time, setTime] = useState("");
	const [date, setDate] = useState(new Date("2021-12-17").setHours(0, 0, 0));
	const [msg, setMsg] = useState("");
	const [ip, setIP] = useState("000.000.000.000");
	const [chats, setChats] = useState({});
	const [likes, setLikes] = useState([]);
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
				ip: ip,
				uid: uid,
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
				like: 0,
			});
		}
	}

	function getLikes() {
		if (localStorage.getItem("likes") !== null) {
			setLikes(JSON.parse(localStorage.getItem("likes")));
		}
	}

	function like(id) {
		setLikes([...likes, id]);
		localStorage.setItem("likes", JSON.stringify([...likes, id]));
		// db 업데이트
		if (id !== null && id !== undefined && id !== "") {
			update(ref(database, "chats/" + id), {
				like: parseInt(chats[id].like) + 1,
			});
		}
	}

	function dislike(id) {
		setLikes(likes.filter(key => key !== id));
		localStorage.setItem(
			"likes",
			JSON.stringify(likes.filter(key => key !== id))
		);
		// db 업데이트
		if (id !== null && id !== undefined && id !== "") {
			update(ref(database, "chats/" + id), {
				like: parseInt(chats[id].like) - 1,
			});
		}
	}

	const getIP = async () => {
		const res = await axios.get("https://geolocation-db.com/json/");
		setIP(res.data.IPv4);
	};

	function getDate() {
		if (localStorage.getItem("date") !== null) {
			console.log(localStorage.getItem("date"));
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
		getDate();
		setTime(getTime());
		getLikes();
		const auth = getAuth();
		signInAnonymously(auth)
			.then(() => {
				setUid(auth.currentUser.uid);
				try {
					onValue(ref(database, "chats"), snapshot => {
						if (snapshot.exists()) {
							setChats(snapshot.val());
						} else {
							console.log("No data available");
						}
					});
				} catch (error) {
					console.log(error);
				}
			})
			.catch(error => {
				console.log(error);
			});

		setWindowDimensions(getWindowDimensions());
		function handleResize() {
			setWindowDimensions(getWindowDimensions());
		}
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		const countdown = setInterval(() => {
			setTime(getTime());
		}, 1000);
		return () => clearInterval(countdown);
	}, [date]);

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
						<span>{time + "\n"} </span>
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
									setDate(new Date(date.setHours(0, 0, 0)));
									localStorage.setItem(
										"date",
										new Date(
											date.setHours(0, 0, 0)
										).toString()
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
								windowDimensions.width > 500 ? "40vw" : "85vw",
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
				<div style={{ marginTop: "20px", marginBottom: "30px" }}>
					{Object.keys(chats)
						.reverse()
						.map(key => (
							<div
								className="chat-box"
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									width:
										windowDimensions.width > 700
											? "60vw"
											: "85vw",
								}}
								key={chats[key].timestamp}
							>
								<div>
									<div
										style={{
											fontSize: "small",
											marginBottom: "5px",
										}}
									>
										{chats[key].timestamp}
										{/* (
										{chats[key].uid.split(".").splice(-1)}) */}
									</div>
									<div
										style={{
											fontSize: "medium",
											fontWeight: "500",
										}}
									>
										{chats[key].message}
									</div>
								</div>
								<div
									style={{
										fontSize: "small",
										display: "flex",
										flexDirection:
											windowDimensions.width <= 700 &&
											"column",
										alignItems: "center",
										justifyItems: "center",
									}}
								>
									{likes.includes(key) ? (
										<AiFillHeart
											style={{
												cursor: "pointer",
											}}
											onClick={() => dislike(key)}
										/>
									) : (
										<AiOutlineHeart
											style={{
												cursor: "pointer",
												marginTop: "1px",
											}}
											onClick={() => like(key)}
										/>
									)}
									<span
										style={{
											marginLeft:
												windowDimensions.width > 700 &&
												"2px",
										}}
									>
										{chats[key].like}
									</span>
								</div>
							</div>
						))}
				</div>
			</div>
			<ins
				className="kakao_ad_area"
				style={{
					display: "none",
				}}
				data-ad-unit="DAN-HdyRNU4jp3bRCOV0"
				data-ad-width="320"
				data-ad-height="100"
			></ins>
			<footer>
				<div
					style={{
						textAlign: "center",
						fontSize: "smaller",
						color: "rgba(255, 255, 255, 0.5)",
						padding: "10px",
						cursor: "pointer",
					}}
					onClick={() =>
						window.open(
							"https://github.com/minr2kb/jongang-counter"
						)
					}
				>
					© 2021. (Kyungbae Min) all rights reserved
				</div>
			</footer>
		</div>
	);
}

export default App;
