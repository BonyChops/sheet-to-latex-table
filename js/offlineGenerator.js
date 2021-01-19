

const downloadOffline = async () => {
    $('.loading-loader').show();
    $('.loading-loaded').hide();
    $('.loading-loaded').removeClass("blue-text")
    $('.loading-mes').text("ダウンロードする準備をしています...");
    $('.loading-title').text("お待ちください...");
    M.Modal.getInstance($('#loading')).open();
    try {
        let body = await new Promise((resolve, reject) => {
            fetch("index.html")
                .then(response => resolve(response.text()))
                .catch((e) => reject(e));
        })
        console.log("show");
        console.log(body);
        const dom = new DOMParser().parseFromString(body, "text/html");
        console.log(dom.scripts);
        console.log(dom.getElementsByTagName('i'));
        const data = [...dom.scripts].concat([...dom.getElementsByTagName('link')]).concat([...dom.getElementsByTagName('i')]).map(async (element) => {
            const url = element.src !== undefined ? element.src : element.href;
            const result = element.tagName !== "I" ? {
                body: element.outerHTML,
                isJS: element.src !== undefined,
                src: url,
                skipped: element.hasAttribute("skip-download"),
                offlineReplaced: element.hasAttribute("offline-replaced"),
                jsBody: element.hasAttribute("skip-download") ? false : await new Promise((resolve, reject) => {
                    fetch(url)
                        .then(response => resolve(response.text()))
                        .catch(e => reject(e));
                })
            } : {
                    skipped: true,
                    offlineReplaced: false,
                    jsBody: false,
                    body: element.outerHTML
                };
            return result;
        });
        Promise.all(data).then(data => userDownload(body, data));
    } catch (e) {
        console.error(e);
        M.toast({ html: 'お使いのブラウザは非対応です．別のブラウザでダウンロードしてください．' });
        M.Modal.getInstance($('#loading')).close();
    }

}

const sleep = (msc) => { return new Promise(resolve => setTimeout(resolve, msc)) }


const userDownload = (body, data) => {
    const getOfflineFunctions = (version) => {
        return `
            const versionCheck = async() => {
                return {
                    "online": false,
                    "version": "${version}"
                };
            }
        `
    }
    data = data.map(el => {
        if (el.jsBody === false) {
            return el;
        }
        el.jsBody.replace('</script>', '{{html "</sc"+"ript>"}}');
        return el;
    })
    console.log("data");
    console.log(data);
    const result = data.reduce((acc, val) => {
        if (!val.skipped) {
            //val.jsBody = val.jsBody.replace('$', '$-');
        }
        //console.log(acc.indexOf(val.body));
        console.log(val)
        console.log(( acc.match( /<body>/g ) || [] ).length)
        return acc.split(val.body).join(val.skipped ? (val.offlineReplaced ? `<script>${getOfflineFunctions(versionInfo.version)}</script>` : ' ') : (val.isJS ? `<script type="text/javascript">\n${val.jsBody}\n</script>` : `<style>\n${val.jsBody}\n</style>`))
        //return acc.replace(val.body, val.skipped ? ' ' : (val.isJS ? `<script type="text/javascript">\n${val.jsBody}\n</script>` : `<style>\n${val.jsBody}\n</style>` ))
    }, body).split('\\({ \\rm \\LaTeX }\\)').join("LaTeX");
    $('.loading-title').text("完了");
    $('.loading-mes').text("ファイルが準備できました．");
    $('.loading-loader').hide();
    $('.loading-loaded').show();
    $('.loading-loaded').addClass("blue-text");
    download(`Sheet-to-LaTeX-Table_${versionInfo.version}.html`, result);
    console.log(result);
    (async () => {
        await sleep(2000);
        M.Modal.getInstance($('#loading')).close();
    })();
}


const download = (filename, text) => {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

const versionCheck = async () => {
    const versionInfo = await new Promise((resolve, reject) => {
        fetch("version.json").then(response => resolve(response.json()))
            .catch((e) => reject(e));
    })
    return versionInfo;
}

console.log(versionInfo);