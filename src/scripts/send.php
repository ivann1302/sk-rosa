<?php 
  // формируем URL, на который будем отправлять запрос в битрикс24
	$queryURL = "https://b24-p3zgrx.bitrix24.ru/rest/1/vu8c00l6ruvrjc05/crm.lead.add.json";

  //собираем данные из формы
	$sPhone = htmlspecialchars($_POST["PHONE"] ?? '');
	$sName = htmlspecialchars($_POST["NAME"] ?? '');
	$sComment = htmlspecialchars($_POST["COMMENTS"] ?? '');
	$sFormSource = htmlspecialchars($_POST["form_source"] ?? 'Не указан');
	
	// Дополнительные поля для калькулятора
	$sObjectType = htmlspecialchars($_POST["object_type"] ?? '');
	$sPropertyClass = htmlspecialchars($_POST["property_class"] ?? '');
	$sLocation = htmlspecialchars($_POST["location"] ?? '');
	
	// Способ связи
	$types = [
		"apartment" => "WhatsApp",
		"office" => "Telegram", 
		"house" => "Позвонить"
	];
	$sCommType = $types[$_POST["property_type"] ?? ''] ?? "Не указан";
	
	$arPhone = (!empty($sPhone)) ? array(array('VALUE' => $sPhone, 'VALUE_TYPE' => 'MOBILE')) : array();
	
	// Формируем расширенный комментарий
	$extendedComment = "Способ связи: $sCommType\n";
	$extendedComment .= "Источник: $sFormSource\n";
	$extendedComment .= "Комментарий: $sComment";
	
	// Добавляем информацию из калькулятора если есть
	if (!empty($sObjectType)) {
		$extendedComment .= "\nТип объекта: $sObjectType";
	}
	if (!empty($sPropertyClass)) {
		$extendedComment .= "\nКласс недвижимости: $sPropertyClass";
	}
	if (!empty($sLocation)) {
		$extendedComment .= "\nМестоположение: $sLocation";
	}
	
	// формируем параметры для создания лида	
	$queryData = http_build_query(array(
		"fields" => array(
			"TITLE"    => "Новая заявка с сайта - $sFormSource",
			"NAME" => $sName,	// имя
			"PHONE" => $arPhone, // телефон
			"COMMENTS" => $extendedComment
		),
		'params' => array("REGISTER_SONET_EVENT" => "Y")	// Y = произвести регистрацию события добавления лида в живой ленте. Дополнительно будет отправлено уведомление ответственному за лиду.	
	));

	// отправляем запрос в Б24 и обрабатываем ответ
	$curl = curl_init();
	curl_setopt_array($curl, array(
		CURLOPT_SSL_VERIFYPEER => 0,
		CURLOPT_POST => 1,
		CURLOPT_HEADER => 0,
		CURLOPT_RETURNTRANSFER => 1,
		CURLOPT_URL => $queryURL,
		CURLOPT_POSTFIELDS => $queryData,
	));
	$result = curl_exec($curl);
	curl_close($curl);
	$result = json_decode($result,1); 
?>