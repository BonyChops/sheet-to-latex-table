$('#inputTable').change(function () {
    sheet2tex($(this).val());
});

$('document').ready(function () {
    $('#outputTable').val('変換した内容がここに出ます\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n')
    updateOptions();
})

$('input').change(function () {
    updateOptions();
});

const updateOptions = () => {
    if ($('#index-mode').is(":checked")) {
        $('.index-mode-format-div').show();
    } else {
        $('.index-mode-format-div').hide();
    }
    if ($('#index-mode-format').is(':checked')) {
        $('.index-mode-number-div').show();
    } else {
        $('.index-mode-number-div').hide();
    }
}


const sheet2tex = (table) => {
    const tableSeparator = " \& ";
    const tableBreakSeparator = " \\\\\n";
	var num_col = table.split("\n")[0].split("\t").length;
    let str_col = [];
	for (i = 0; i < num_col; ++i) {
		str_col.push($('#demical-point-format').is(':checked') ? "D{.}{.}{9}" : "c");
	}
	str_col = str_col.join("|");
    const tableArray = table.split('\n')
        .map(col => col.split('\t').map(el => {
            if(!$('#index-mode').is(':checked')){
                return el;
            }
            if (isNaN(el) || el === '') {
                if ($('#demical-point-format').is(':checked')) {
                    return `\\multicolumn{1}{c|}{${el === '' ? '-' : el}}`;
                } else {
                    return el;
                }
            }
            const eString = Number(el.trim()).toExponential($('#index-mode-format').is(':checked') ? $('#index-mode-number').val() : undefined);
            const ePos = eString.indexOf("e");
            return eString.substr(0, ePos) + ` \\times 10^{${eString.substr(ePos + (eString.indexOf("+") !== -1 ? 2 : 1))}}`;
        }))
    console.log(tableArray);
    const body = tableArray
        .map(el => el.join(tableSeparator))
        .join(tableBreakSeparator);
    const tableHeader = "\\[ \\begin{array}" + "{" + String(str_col) + "}";
    const tableFooter = "\\end{array} \\]";

    $('#outputTable').val(tableHeader + body + tableFooter);
}


const copy = (name) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText($(name).val());
        M.toast({ html: 'コピーしました！' })
    } else {
        M.toast({ html: 'コピーできなかったみたいです...<br /><i><s>すまないがIEは帰ってくれないか？</s></i>' })

    }
}