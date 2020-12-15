const downloadOffline = async () => {
    M.Modal.getInstance($('#loading')).open();
    let body = await new Promise((resolve, reject) => {
        fetch("index.html")
            .then(response => resolve(response.text()))
            .catch((e) => reject(e));
    })
    //console.log(body);
    const dom = new DOMParser().parseFromString(body, "text/html");
    console.log(dom.scripts);
    console.log(dom.getElementsByTagName('link'));
    const data = [...dom.scripts].concat([...dom.getElementsByTagName('link')]).map(async(element) => {
        const url = element.src !== undefined ? element.src : element.href;
        const result = {
            body: element.outerHTML,
            isJS : element.src !== undefined,
            src: url,
            skipped: element.hasAttribute("skip-download"),
            jsBody: element.hasAttribute("skip-download") ? false : await new Promise((resolve, reject) => {
                fetch(url)
                    .then(response => resolve(response.text()))
                    .catch(e => reject(e));
            })
        }
        return result;
    });
    Promise.all(data).then(data => userDownload(body, data));
}

const userDownload = (body, data) => {
    console.log(data);
    data.map(el => {
        if(el.jsBody === false){
            return el;
        }
        el.jsBody.replace('</script>', '{{html "</sc"+"ript>"}}');
        return el;
    })
    const result = data.reduce((acc,val) =>{
        if(!val.skipped){
            val.jsBody = val.jsBody.replace('$' , '$-');
        }
        console.log(acc.indexOf(val.body));
        console.log(val)
        return acc.split(val.body).join(val.skipped ? ' ' : (val.isJS ? `<script type="text/javascript">\n${val.jsBody}\n</script>` : `<style>\n${val.jsBody}\n</style>`) )
        //return acc.replace(val.body, val.skipped ? ' ' : (val.isJS ? `<script type="text/javascript">\n${val.jsBody}\n</script>` : `<style>\n${val.jsBody}\n</style>` ))
    }, body);
    download("test.html", result);
    console.log(result);
}

const download = (filename, text)  => {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}