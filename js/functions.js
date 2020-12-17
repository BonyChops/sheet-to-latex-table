versionCheck()
    .then(data => versionInfo = data)
    .then(data => $('.version-info').text("Ver. " + data.version + (!data.online ? ' offline' : '')))
    .then(data => {
        //console.log(location.search);
        //window.history.replaceState('','','/');
        console.log(versionInfo)
        if (versionInfo.online === false) {
            console.log("Offline mode");
            $('.offline-hide').hide();
            $('nav').removeClass();
            $('nav').addClass("pink lighten-2");
        }
        console.log("ping");
        ping('https://google.com/').then(function (delta) {
            console.log('Ping time was ' + String(delta) + ' ms');
        }).catch(function (err) {
            console.error('Could not ping remote URL', err);
        });
    });
