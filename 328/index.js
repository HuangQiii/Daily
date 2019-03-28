function getData(urlArray = []) {
  const result = [];
  const length = urlArray.length;
  const indexSign = 0;
  urlArray.forEach((url, i) => {
    fetch(url)
      .then((res) => {
        result[i] = res;
        for(let j = indexSign; j < length; j++) {
          if (result[i]) {
            if (!res[j].flag) {
              console.log(res[j]);
              indexSign = j + 1;
            }
          } else {
            break;
          }
        }
      });
  });
  return result.map(r => r.data);
}