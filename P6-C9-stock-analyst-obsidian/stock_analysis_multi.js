module.exports = async (tp, ticks) => {
  new Notice(`📡 ${ticks.join(", ")} 분석 중...`);

  const url = "https://api.dify.ai/v1/workflows/run";
  const headers = {
    Authorization: "Bearer app-abcd", // 여기에 DIfy 워크플로우 API 키를 넣어주세요
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    const result = await response.json();
    const analysis = result?.data?.outputs?.text;

    if (!analysis) {
      throw new Error("Dify 분석 결과가 비어 있습니다.");
    }

    // 오늘 날짜 포맷 (YYYY-MM-DD)
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    // 현재 파일의 상대 경로를 가져옴
    const currentFilePath = tp.file.path(true);
    console.log("Current file path:", currentFilePath);

    // 내용 추가
    const note = tp.file.find_tfile(currentFilePath);
    const content = `# 📈 주식시황 분석 (${formattedDate})\n\n${analysis}`;
    await app.vault.append(note, content);

    // 현재 파일 경로에서 폴더만 추출
    const currentFolder = currentFilePath.split("/").slice(0, -1).join("/");

    const fileName = `${formattedDate} 주식시황 분석`;
    const newPath = `${currentFolder}/${fileName}`;
    console.log("New path:", newPath);

    // 파일 이동
    await tp.file.move(newPath);

    new Notice(`✅ ${ticks.join(", ")} 분석 노트 생성 완료!`);
    return `📄 새로운 노트를 생성했습니다:\n${newPath}`;
  } catch (err) {
    console.error(err);
    new Notice(`❌ ${ticks.join(", ")} 분석 실패: ${err.message}`);
    return `⚠️ 오류 발생: ${err.message}`;
  }
};
