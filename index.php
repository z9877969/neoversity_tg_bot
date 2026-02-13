<?php

//streams vars  ========================================
$S_1 = 'MCS_1';
$S_2 = 'MCS_2';
$S_3 = 'MCS_3';
$S_4 = 'MCS_4';
$S_5 = 'MCS_5';
$S_6 = 'MCS_6';
$S_7 = 'MCS_7';
$S_8 = 'MCS_8';
$S_9 = 'MCS_9';
$S_10 = 'MCS_10';

$Data_1 = 'MDS_1';
$Data_2 = 'MDS_2';
$Data_3 = 'MDS_3';
$Data_4 = 'MDS_4';
$Data_5 = 'MDS_5';
$Data_6 = 'MDS_6';
$Data_7 = 'MDS_7';
$Data_8 = 'MDS_8';

$Syber_1 = 'MCbS_1';
$Syber_2 = 'MCbS_2';
$Syber_3 = 'MCbS_3';
$Syber_4 = 'MCbS_4';
$Syber_5 = 'MCbS_5';
$Syber_6 = 'MCbS_6';

$Inter_1 = 'MSHCID_1';
$Inter_2 = 'MSHCID_2';
$Inter_3 = 'MSHCID_3';

//db ==================
$dbHost = 'localhost';
$dbUsername = 'lpunitlz_neo';
$dbPassword = 'v*U&9pyHixs%';
$dbName = 'lpunitlz_neo';

//tg token
$apiToken = "7936760236:AAFwtIXQ0RkH3kZjVeSo5zYYQ-JjOyeHOCc";

//===============================================================================
function sendMessage($chatId, $message)
{
	global $apiToken;
	$url = "https://api.telegram.org/bot$apiToken/sendMessage";
	$postFields = array(
		'chat_id' => $chatId,
		'text' => $message,
		'parse_mode' => 'html',
	);
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type:multipart/form-data"));
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
	curl_exec($ch);
}

// Обробка основних команд бота =================================================
$content = file_get_contents("php://input");
$update = json_decode($content, TRUE);

if (isset($update["message"])) {
	$message = $update["message"];
	$chatId = $message["chat"]["id"];
	$text = isset($message["text"]) ? $message["text"] : "";

	// Перевірка, чи користувач уже зареєстрований ===============================
	$registrationStage = getRegistrationStage($chatId);
	$editStage = getEditStage($chatId);

	if ($text == "/start") {
		if ($registrationStage && $registrationStage === 'completed') {
			sendMainMenu($chatId);
		} else {
			setRegistrationStage($chatId, "waiting_for_name");
			sendMessage($chatId, "👉 Введіть ваше прізвище та імʼя. Наприклад: Бубоненко Анатолій");
		}
	} else if ($text == "👤 Мій профіль") {
		if ($registrationStage === 'completed') {
			sendUserProfile($chatId);
		}
	} else if ($text == "❔ Часті питання") {
		sendFAQList($chatId);
	} else if ($text == "💬 Контакти менеджера") {
		sendManagerContacts($chatId);
	} else if ($text == "📋 Додаткові послуги") {
		sendServiceList($chatId);
	} else if ($text == "📢 Останні новини") {
		sendNewsList($chatId);
	} else if ($text == "📅 Мій графік") {
		sendScheduleDetails($chatId);
	} else if ($registrationStage == "waiting_for_name" && preg_match("/^[\p{L} '-]+$/u", $text)) {
		saveUserFullName($chatId, $text);
		sendMessage($chatId, "Тепер надішліть вашу електронну пошту");
		setRegistrationStage($chatId, "waiting_for_email");
	} else if ($registrationStage == "waiting_for_email") {
		if (filter_var($text, FILTER_VALIDATE_EMAIL)) {
			saveUserEmail($chatId, $text);
			sendDirectionSelectionButtons($chatId);
			setRegistrationStage($chatId, "waiting_for_direction");
		} else {
			sendMessage($chatId, "❌ Eлектронна пошта введена неправильно");
		}
	} else if ($text == "⬅️ Назад") {
		if ($registrationStage === 'completed') {
			setEditStage($chatId, "null");
			sendMainMenu($chatId);
		}
	} else if ($text == "Редагувати ім'я") {
		sendMessage($chatId, "Введіть нове ім'я:");
		setEditStage($chatId, "null");
		setEditStage($chatId, "edit_full_name");
	} else if ($editStage === "edit_full_name") {
		saveUserFullName($chatId, $text);
		setEditStage($chatId, "null");
	}
	//email
	else if ($text == "Редагувати email") {
		sendMessage($chatId, "Введіть новий email:");
		setEditStage($chatId, "null");
		setEditStage($chatId, "edit_email");
	} else if ($editStage === "edit_email") {
		saveUserEmail($chatId, $text);
		setEditStage($chatId, "null");
	}
	//напрямок
	else if ($text == "Редагувати напрямок") {
		setEditStage($chatId, "null");
		sendDirectionSelectionButtons($chatId);
	}
	//потік
	else if ($text == "Редагувати потік") {
		setEditStage($chatId, "null");
		sendStreamSelectionButtons($chatId, getUserDirection($chatId));
	} else {
		sendMessage($chatId, "Я не розумію цю команду. Спробуйте ще раз");
	}
}


// кнопки ===========================================================================
if (isset($update["callback_query"])) {
	$callbackQuery = $update["callback_query"];
	$chatId = $callbackQuery["from"]["id"];
	$callbackData = $callbackQuery["data"];

	$registrationStage = getRegistrationStage($chatId);

	// Перевіряємо вибір напрямку
	if (strpos($callbackData, "direction_") !== false) {
		$direction = str_replace("direction_", "", $callbackData);
		saveUserDirection($chatId, $direction);
		setRegistrationStage($chatId, "waiting_for_stream");
		sendStreamSelectionButtons($chatId, $direction);
	}
	// Перевіряємо вибір потоку
	else if (strpos($callbackData, "stream_") !== false) {
		$stream = str_replace("stream_", "", $callbackData);
		saveUserStream($chatId, $stream);
		if ($registrationStage !== 'completed') {
			setRegistrationStage($chatId, "completed");
			sendMainMenu($chatId);
		}
	} else if (strpos($callbackData, "faq_") === 0) {
		$faqId = str_replace("faq_", "", $callbackData);
		if ($registrationStage === 'completed') {
			sendFAQAnswer($chatId, $faqId);
		}
	} else if (strpos($callbackData, "service_") === 0) {
		$serviceId = str_replace("service_", "", $callbackData);
		if ($registrationStage === 'completed') {
			sendServiceDetails($chatId, $serviceId);
		}
	} else if (strpos($callbackData, "news_") === 0) {
		$newsId = str_replace("news_", "", $callbackData);
		if ($registrationStage === 'completed') {
			sendNewsDetails($chatId, $newsId);
		}
	} else if (strpos($callbackData, "schedule_") === 0) {
		$scheduleId = str_replace("schedule_", "", $callbackData);
		if ($registrationStage === 'completed') {
			sendScheduleDetails($chatId, $scheduleId);
		}
	}
}

// меню =============================================================================
function sendMainMenu($chatId)
{
	global $apiToken;

	$keyboard = [
		['👤 Мій профіль', '❔ Часті питання'],
		['📋 Додаткові послуги', '💬 Контакти менеджера'],
		['📢 Останні новини', '📅 Мій графік']
	];

	$replyMarkup = json_encode([
		'keyboard' => $keyboard,
		'resize_keyboard' => true,
		'one_time_keyboard' => false
	]);

	$registrationStage = getRegistrationStage($chatId);

	if ($registrationStage === 'completed') {
		$text = 'Чим можу допомогти?';
	} else {
		$text = 'Дякую! Реєстрація завершена ✅️';
	}

	$url = "https://api.telegram.org/bot$apiToken/sendMessage";
	$postFields = [
		'chat_id' => $chatId,
		'text' => $text,
		'reply_markup' => $replyMarkup
	];

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
	curl_exec($ch);
}

// перевірка валідності дати ===============================================
function validateDate($date, $format = 'Y-m-d')
{
	$d = DateTime::createFromFormat($format, $date);
	return $d && $d->format($format) === $date;
}

// встановлення стадії реєстрації ===============================================
function setRegistrationStage($chatId, $stage)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName;

	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		sendMessage($chatId, "Помилка підключення до бази даних");
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	$stmt = $conn->prepare("UPDATE users SET registration_stage = ? WHERE telegram_id = ?");

	if ($stmt === false) {
		sendMessage($chatId, "Помилка підготовки запиту");
		return;
	}

	$chatId = (int)$chatId;

	$stmt->bind_param("si", $stage, $chatId);

	if (!$stmt->execute()) {
		sendMessage($chatId, "Помилка виконання запиту");
	}

	$stmt->close();
	$conn->close();
}

// отримання стадії реєстрації ===============================================
function getRegistrationStage($chatId)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName;

	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	$stmt = $conn->prepare("SELECT registration_stage FROM users WHERE telegram_id = ?");
	$stmt->bind_param("i", $chatId);
	$stmt->execute();
	$stmt->bind_result($stage);
	$stmt->fetch();
	$stmt->close();
	$conn->close();

	return $stage ? $stage : "waiting_for_name";  // Якщо користувач ще не зареєстрований, почати з ПІБ
}

// отримання стадії редагування ===============================================
function getEditStage($chatId)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName;

	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	$stmt = $conn->prepare("SELECT edit_stage FROM users WHERE telegram_id = ?");
	$stmt->bind_param("i", $chatId);
	$stmt->execute();
	$stmt->bind_result($stage);
	$stmt->fetch();
	$stmt->close();
	$conn->close();

	return $stage ? $stage : "waiting_for_name";
}

// встановлення стадії редагування  ===============================================
function setEditStage($chatId, $stage)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName;

	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	$stmt = $conn->prepare("UPDATE users SET edit_stage = ? WHERE telegram_id = ?");
	$stmt->bind_param("si", $stage, $chatId);
	$stmt->execute();
	$stmt->close();
	$conn->close();
}

// зберегти дату народження ===============================================
function saveUserBirthdate($chatId, $birthdate)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName;

	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	$stmt = $conn->prepare("UPDATE users SET birthdate = ? WHERE telegram_id = ?");
	$stmt->bind_param("si", $birthdate, $chatId);
	$stmt->execute();
	$stmt->close();
	$conn->close();
}

// зберегти напрямок ==============================================================================
function saveUserDirection($chatId, $direction)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName;

	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	$stmt = $conn->prepare("UPDATE users SET direction = ? WHERE telegram_id = ?");
	$stmt->bind_param("si", $direction, $chatId);
	$stmt->execute();
	$stmt->close();
	$conn->close();
}

function getUserDirection($chatId)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName;

	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	$stmt = $conn->prepare("SELECT direction FROM users WHERE telegram_id = ?");
	$stmt->bind_param("i", $chatId);
	$stmt->execute();
	$stmt->bind_result($direction);
	$stmt->fetch();
	$stmt->close();
	$conn->close();

	return $direction;
}

// надіслати кнопки напрямів ======================================================================================
function sendDirectionSelectionButtons($chatId)
{
	global $apiToken;

	$url = "https://api.telegram.org/bot$apiToken/sendMessage";
	$postFields = array(
		'chat_id' => $chatId,
		'text' => "👉 Оберіть ваш напрямок:",
		'reply_markup' => json_encode(array(
			'inline_keyboard' => array(
				array(
					array('text' => "Software Engineering", 'callback_data' => "direction_Software"),
					array('text' => "Data Science & Data Analytics", 'callback_data' => "direction_Data")
				),
				array(
					array('text' => "Cybersecurity", 'callback_data' => "direction_Cybersecurity"),
					array('text' => "Human-Computer Interaction and Design", 'callback_data' => "direction_Interaction")
				)
			)
		))
	);

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type:multipart/form-data"));
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
	curl_exec($ch);
}

// надіслати кнопки напрямів =================================================================================
function sendStreamSelectionButtons($chatId, $direction)
{
	global $apiToken, $S_1, $S_2, $S_3, $S_4, $S_5, $S_6, $S_7, $S_8, $S_9, $S_10;
	global $Data_1, $Data_2, $Data_3, $Data_4, $Data_5, $Data_6, $Data_7, $Data_8;
	global $Syber_1, $Syber_2, $Syber_3, $Syber_4, $Syber_5, $Syber_6;
	global $Inter_1, $Inter_2, $Inter_3;

	$streams = array();
	if ($direction == "Software") {
		$streams = [
			[
				array('text' => "1️⃣", 'callback_data' => 'stream_' . $S_1),
				array('text' => "2️⃣", 'callback_data' => 'stream_' . $S_2),
				array('text' => "3️⃣", 'callback_data' => 'stream_' . $S_3),
				array('text' => "4️⃣", 'callback_data' => 'stream_' . $S_4),
				array('text' => "5️⃣", 'callback_data' => 'stream_' . $S_5),
			],
			[
				array('text' => "6️⃣", 'callback_data' => 'stream_' . $S_6),
				array('text' => "7️⃣", 'callback_data' => 'stream_' . $S_7),
				array('text' => "8️⃣", 'callback_data' => 'stream_' . $S_8),
				array('text' => "9️⃣", 'callback_data' => 'stream_' . $S_9),
				array('text' => "1️⃣0️⃣", 'callback_data' => 'stream_' . $S_10),
			]
		];
	} else if ($direction == "Data") {
		$streams = array(
			[
				array('text' => "1️⃣", 'callback_data' => 'stream_' . $Data_1),
				array('text' => "2️⃣", 'callback_data' => 'stream_' . $Data_2),
				array('text' => "3️⃣", 'callback_data' => 'stream_' . $Data_3),
				array('text' => "4️⃣", 'callback_data' => 'stream_' . $Data_4),
				array('text' => "5️⃣", 'callback_data' => 'stream_' . $Data_5),
				array('text' => "6️⃣", 'callback_data' => 'stream_' . $Data_6),
				array('text' => "7️⃣", 'callback_data' => 'stream_' . $Data_7),
				array('text' => "8️⃣", 'callback_data' => 'stream_' . $Data_8),
			]
		);
	} else if ($direction == "Cybersecurity") {
		$streams = array(
			[
				array('text' => "1️⃣", 'callback_data' => 'stream_' . $Syber_1),
				array('text' => "2️⃣", 'callback_data' => 'stream_' . $Syber_2),
				array('text' => "3️⃣", 'callback_data' => 'stream_' . $Syber_3),
				array('text' => "4️⃣", 'callback_data' => 'stream_' . $Syber_4),
				array('text' => "5️⃣", 'callback_data' => 'stream_' . $Syber_5),
				array('text' => "6️⃣", 'callback_data' => 'stream_' . $Syber_6),
			]
		);
	} else if ($direction == "Interaction") {
		$streams = array(
			[
				array('text' => "1️⃣", 'callback_data' => 'stream_' . $Inter_1),
				array('text' => "2️⃣", 'callback_data' => 'stream_' . $Inter_2),
				array('text' => "3️⃣", 'callback_data' => 'stream_' . $Inter_3),
			]
		);
	}

	$url = "https://api.telegram.org/bot$apiToken/sendMessage";
	$postFields = array(
		'chat_id' => $chatId,
		'text' => "👉 Оберіть ваш потік:",
		'reply_markup' => json_encode(array(
			'inline_keyboard' => $streams
		))
	);

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type:multipart/form-data"));
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
	curl_exec($ch);
}

// збереження потоку ==========================================================
function saveUserStream($chatId, $stream)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName, $apiToken;

	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	$stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE telegram_id = ?");
	$stmt->bind_param("i", $chatId);
	$stmt->execute();
	$stmt->bind_result($count);
	$stmt->fetch();
	$stmt->close();

	if ($count > 0) {
		$stmt = $conn->prepare("UPDATE users SET stream = ? WHERE telegram_id = ?");
		$stmt->bind_param("si", $stream, $chatId);

		if ($stmt->execute()) {
			sendMessage($chatId, "Потік збережено ✅");
		} else {
			sendMessage($chatId, "Виникла помилка при оновленні потоку");
		}

		$stmt->close();
	} else {
		$stmt = $conn->prepare("INSERT INTO users (telegram_id, stream) VALUES (?, ?)");
		$stmt->bind_param("is", $chatId, $stream);

		if ($stmt->execute()) {
			//sendMessage($chatId, "Email успішно збережено.");
		} else {
			sendMessage($chatId, "Виникла помилка при збереженні потоку");
		}

		$stmt->close();
	}

	$conn->close();
}

// збереження ПІБ ===============================================
function saveUserFullName($chatId, $fullName)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName;
	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	// Перевірити, чи існує користувач
	$stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE telegram_id = ?");
	$stmt->bind_param("i", $chatId);
	$stmt->execute();
	$stmt->bind_result($count);
	$stmt->fetch();
	$stmt->close();

	if ($count > 0) {
		// Оновлення запису користувача
		$stmt = $conn->prepare("UPDATE users SET full_name = ? WHERE telegram_id = ?");
		$stmt->bind_param("si", $fullName, $chatId);
		if ($stmt->execute()) {
			sendMessage($chatId, "Ім'я збережено ✅");
		} else {
			sendMessage($chatId, "Виникла помилка при оновленні імені");
		}
		$stmt->close();
	} else {
		// Створення нового запису користувача
		$stmt = $conn->prepare("INSERT INTO users (telegram_id, full_name) VALUES (?, ?)");
		$stmt->bind_param("is", $chatId, $fullName);
		$stmt->execute();
		$stmt->close();
	}

	$conn->close();
}

// збереження email ======================================================================================
function saveUserEmail($chatId, $email)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName;

	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	// Перевірити, чи існує користувач
	$stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE telegram_id = ?");
	$stmt->bind_param("i", $chatId);
	$stmt->execute();
	$stmt->bind_result($count);
	$stmt->fetch();
	$stmt->close();

	if ($count > 0) {
		// Оновлення запису користувача
		$stmt = $conn->prepare("UPDATE users SET email = ? WHERE telegram_id = ?");
		$stmt->bind_param("si", $email, $chatId);

		if ($stmt->execute()) {
			sendMessage($chatId, "Email збережено ✅");
		} else {
			sendMessage($chatId, "Виникла помилка при збереженні електронної пошти");
		}

		$stmt->close();
	} else {
		// Створення нового запису користувача
		$stmt = $conn->prepare("INSERT INTO users (telegram_id, email) VALUES (?, ?)");
		$stmt->bind_param("is", $chatId, $email);

		if ($stmt->execute()) {
			//sendMessage($chatId, "Email успішно збережено.");
		} else {
			sendMessage($chatId, "Виникла помилка при збереженні електронної пошти");
		}

		$stmt->close();
	}

	$conn->close();
}


// отримання частих питань (FAQ) ========================================================
function sendFAQList($chatId)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName, $apiToken;
	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	$sql = "SELECT id, question FROM faq";
	$result = $conn->query($sql);

	if ($result->num_rows > 0) {
		$keyboard = [];
		while ($row = $result->fetch_assoc()) {
			$keyboard[] = [
				['text' => $row["question"], 'callback_data' => "faq_" . $row["id"]]
			];
		}

		$replyMarkup = json_encode([
			'inline_keyboard' => $keyboard
		]);

		$url = "https://api.telegram.org/bot$apiToken/sendMessage";
		$postFields = [
			'chat_id' => $chatId,
			'text' => "👉 Оберіть питання:",
			'reply_markup' => $replyMarkup,
		];

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
		curl_exec($ch);
	} else {
		sendMessage($chatId, "Поки що немає жодних частих питань.");
	}

	$conn->close();
}

function sendFAQAnswer($chatId, $faqId)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName, $apiToken;
	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	// Отримуємо запитання та відповідь за ID
	$stmt = $conn->prepare("SELECT question, answer FROM faq WHERE id = ?");
	$stmt->bind_param("i", $faqId);
	$stmt->execute();
	$stmt->bind_result($question, $answer);
	$stmt->fetch();
	$stmt->close();
	$conn->close();

	// Відправка відповіді користувачу
	$faqMessage = "❓ *$question*\n\n" . $answer;
	$url = "https://api.telegram.org/bot$apiToken/sendMessage";
	$postFields = [
		'chat_id' => $chatId,
		'text' => $faqMessage,
		'parse_mode' => 'Markdown'
	];

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
	curl_exec($ch);
}


// отримання новин ================================================================
function sendNewsList($chatId)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName, $apiToken;

	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	// Отримуємо потік користувача
	$stmt = $conn->prepare("SELECT stream FROM users WHERE telegram_id = ?");
	$stmt->bind_param("i", $chatId);
	$stmt->execute();
	$stmt->bind_result($stream);
	$stmt->fetch();
	$stmt->close();

	// Отримуємо новини, які відповідають потоку користувача
	$stmt = $conn->prepare("SELECT id, news_title FROM news WHERE FIND_IN_SET(?, news_streams)");
	$stmt->bind_param("s", $stream);
	$stmt->execute();
	$result = $stmt->get_result();

	if ($result->num_rows > 0) {
		$keyboard = [];
		while ($row = $result->fetch_assoc()) {
			$keyboard[] = [
				['text' => $row["news_title"], 'callback_data' => "news_" . $row["id"]]
			];
		}

		$replyMarkup = json_encode([
			'inline_keyboard' => $keyboard
		]);

		// Надсилаємо список новин
		$url = "https://api.telegram.org/bot$apiToken/sendMessage";
		$postFields = [
			'chat_id' => $chatId,
			'text' => "👉 Оберіть новину:",
			'reply_markup' => $replyMarkup
		];

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
		curl_exec($ch);
	} else {
		sendMessage($chatId, "Поки що немає новин для вашого потоку.");
	}

	$conn->close();
}

function sendNewsDetails($chatId, $newsId)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName, $apiToken;
	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	// Отримуємо деталі новини
	$stmt = $conn->prepare("SELECT news_title, news_description FROM news WHERE id = ?");
	$stmt->bind_param("i", $newsId);
	$stmt->execute();
	$stmt->bind_result($newsTitle, $newsDescription);
	$stmt->fetch();
	$stmt->close();
	$conn->close();

	// Формуємо повідомлення з деталями новини
	$newsMessage = "📰 *$newsTitle*\n\n" . $newsDescription;

	// Відправляємо повідомлення з деталями новини
	$url = "https://api.telegram.org/bot$apiToken/sendMessage";
	$postFields = [
		'chat_id' => $chatId,
		'text' => $newsMessage,
		'parse_mode' => 'Markdown'
	];

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
	curl_exec($ch);
}

// отримання послуг ================================================================
function sendServiceList($chatId)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName, $apiToken;

	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	// Отримуємо потік користувача
	$stmt = $conn->prepare("SELECT stream FROM users WHERE telegram_id = ?");
	$stmt->bind_param("i", $chatId);
	$stmt->execute();
	$stmt->bind_result($stream);
	$stmt->fetch();
	$stmt->close();

	// Отримуємо послуги, які відповідають потоку користувача
	$stmt = $conn->prepare("SELECT id, services_name FROM services WHERE FIND_IN_SET(?, services_streams)");
	$stmt->bind_param("s", $stream);
	$stmt->execute();
	$result = $stmt->get_result();

	if ($result->num_rows > 0) {
		$keyboard = [];
		while ($row = $result->fetch_assoc()) {
			$keyboard[] = [
				['text' => $row["services_name"], 'callback_data' => "service_" . $row["id"]]
			];
		}

		$replyMarkup = json_encode([
			'inline_keyboard' => $keyboard
		]);

		// Надсилаємо список послуг
		$url = "https://api.telegram.org/bot$apiToken/sendMessage";
		$postFields = [
			'chat_id' => $chatId,
			'text' => "👉 Оберіть послугу:",
			'reply_markup' => $replyMarkup
		];

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
		curl_exec($ch);
	} else {
		sendMessage($chatId, "Поки що немає послуг для вашого потоку.");
	}

	$conn->close();
}

function sendServiceDetails($chatId, $serviceId)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName, $apiToken;

	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	$stmt = $conn->prepare("SELECT services_name, services_description, services_link FROM services WHERE id = ?");
	$stmt->bind_param("i", $serviceId);
	$stmt->execute();
	$stmt->bind_result($serviceName, $serviceDescription, $servicesLink);
	$stmt->fetch();
	$stmt->close();
	$conn->close();

	$serviceMessage = "🔹 *$serviceName*\n\n" . $serviceDescription;

	$replyMarkup = json_encode([
		'inline_keyboard' => [
			[
				['text' => 'Перейти до послуги', 'url' => $servicesLink]
			]
		]
	]);

	$url = "https://api.telegram.org/bot$apiToken/sendMessage";
	$postFields = [
		'chat_id' => $chatId,
		'text' => $serviceMessage,
		'parse_mode' => 'Markdown',
		'reply_markup' => $replyMarkup
	];

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
	curl_exec($ch);
}

// надсилання контактів від менеджера ===============================================
function sendManagerContacts($chatId)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName, $apiToken;

	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	// Отримуємо потік користувача
	$stmt = $conn->prepare("SELECT stream FROM users WHERE telegram_id = ?");
	$stmt->bind_param("i", $chatId);
	$stmt->execute();
	$stmt->bind_result($stream);
	$stmt->fetch();
	$stmt->close();

	// Отримуємо контакти менеджера для цього потоку
	$stmt = $conn->prepare("SELECT manager_name, manager_email, manager_phone FROM manager_contacts WHERE FIND_IN_SET(?, managers_streams)");
	$stmt->bind_param("s", $stream);
	$stmt->execute();
	$result = $stmt->get_result();

	if ($result->num_rows > 0) {
		while ($row = $result->fetch_assoc()) {

			$managerInfo = "👤 {$row['manager_name']}\n";
			$managerInfo .= "✉️ Email: {$row['manager_email']}\n";
			$managerInfo .= "📞 Телефон: {$row['manager_phone']}\n";

			sendMessage($chatId, $managerInfo);
		}
	} else {
		sendMessage($chatId, "Поки що немає контактів менеджера для вашого потоку.");
	}

	$conn->close();
}

// редагування профілю користувача ===============================================
function sendUserProfile($chatId)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName, $apiToken;

	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	$stmt = $conn->prepare("SELECT full_name, email, birthdate, direction, stream FROM users WHERE telegram_id = ?");
	$stmt->bind_param("i", $chatId);
	$stmt->execute();
	$stmt->bind_result($fullName, $email, $birthdate, $direction, $stream);
	$stmt->fetch();
	$stmt->close();
	$conn->close();

	$profileMessage = "👤 Ваш профіль\n";
	$profileMessage .= "Ім'я: $fullName\n";
	$profileMessage .= "Email: $email\n";
	// $profileMessage .= "Дата народження: $birthdate\n";
	$profileMessage .= "Напрямок: $direction\n";
	$profileMessage .= "Потік: $stream\n";

	$keyboard = [
		['Редагувати ім\'я', 'Редагувати email'],
		['Редагувати напрямок', 'Редагувати потік'],
		['⬅️ Назад'],
	];

	$replyMarkup = json_encode([
		'keyboard' => $keyboard,
		'resize_keyboard' => true,
		'one_time_keyboard' => false
	]);

	$url = "https://api.telegram.org/bot$apiToken/sendMessage";
	$postFields = [
		'chat_id' => $chatId,
		'text' => $profileMessage,
		'reply_markup' => $replyMarkup
	];

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
	curl_exec($ch);
}

// надсилання пуш-повідомлень від менеджера ===============================================
function sendPushNotification($stream, $message)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName;
	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	// Отримати всіх користувачів з певного потоку
	$stmt = $conn->prepare("SELECT telegram_id FROM users WHERE stream = ?");
	$stmt->bind_param("s", $stream);
	$stmt->execute();
	$result = $stmt->get_result();

	while ($row = $result->fetch_assoc()) {
		sendMessage($row["telegram_id"], $message);
	}

	$stmt->close();
	$conn->close();
}

// отримання графіку ================================================================
function sendScheduleDetails($chatId)
{
	global $dbHost, $dbUsername, $dbPassword, $dbName, $apiToken;
	$conn = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);
	$conn->set_charset("utf8mb4");

	if ($conn->connect_error) {
		die("Помилка підключення до бази даних: " . $conn->connect_error);
	}

	// Отримуємо потік користувача
	$stmt = $conn->prepare("SELECT stream FROM users WHERE telegram_id = ?");
	$stmt->bind_param("i", $chatId);
	$stmt->execute();
	$stmt->bind_result($stream);
	$stmt->fetch();
	$stmt->close();

	// Отримуємо деталі 
	$stmt = $conn->prepare("SELECT schedule_title, schedule_description, schedule_link FROM schedule WHERE FIND_IN_SET(?, schedule_streams)");
	$stmt->bind_param("s", $stream);
	$stmt->execute();
	$stmt->bind_result($scheduleTitle, $scheduleDescription, $scheduleLink);

	while ($stmt->fetch()) {
		$scheduleMessage = "*$scheduleTitle*\n\n" . $scheduleDescription;

		$replyMarkup = json_encode([
			'inline_keyboard' => [
				[
					['text' => 'Переглянути графік', 'url' => $scheduleLink]
				]
			]
		]);

		$url = "https://api.telegram.org/bot$apiToken/sendMessage";
		$postFields = [
			'chat_id' => $chatId,
			'text' => $scheduleMessage,
			'parse_mode' => 'Markdown',
			'reply_markup' => $replyMarkup
		];

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
		curl_exec($ch);
		curl_close($ch);

		sleep(1);
	}
}