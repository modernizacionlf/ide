
const login = {
    res: {},

    _ajax: function (data, callback) { // In case there isn't jQuery, fetch may be an option

        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            res = { response: xhr.response, status: xhr.status };
            if (xhr.readyState === XMLHttpRequest.DONE) {
                let status = xhr.status;
                if (status >= 200 && status < 400) {
                    callback ? callback(res) : res;
                } else {
                    console.log(`Ajax request returned error: ${xhr.response}`);
                }
            }
        }

        xhr.open(data.method, data.url, true);
        if (data.method === 'PUT' ) { // Adds authorization header for password resetting
            xhr.withCredentials = true;
            let credentials = btoa(data.usr + ":" + data.pwd);
            xhr.setRequestHeader('Authorization', `Basic ${credentials}`);
        }
        xhr.setRequestHeader(data.reqHeader.key, data.reqHeader.val);
        xhr.send(data.params);
    },

    _append: async function (file, format, parent) {
        // file must match '/path/to/file.extension'
        let parentElement = null;
        let path = window.location.pathname;

        parentElement = parent == 'body' ? document.body : document.getElementById(parent);

        let element = document.createElement("div");
    
        const elementContent = await fetch(window.location.origin + path.replace('index.html', '') + file)
        .then(res => {
            return res.text();
        });

        element.innerHTML = elementContent;
        parentElement.appendChild(element);
    },

    _listeners: function () {
        document.getElementById("logoutBtn").addEventListener('click', this.logout); // convert UI to object
        loginForm.submit.addEventListener('click', this.submit);
        loginForm.resetPwd.addEventListener('click', this.resetPwd);
    },

    load: async function () {
        await login._append("src/js/components/login/navbtn.html", "html", "logo-navbar");
        await login._append("src/js/components/login/form.html", "html", "body");
        if(document.cookie.includes('user')){
            document.getElementById("logoutBtn").classList.remove("hidden")
            document.getElementById("loginBtn").classList.add("hidden")
        }
        login._listeners();
    },

    submit: function (event) {
        event.preventDefault();
        login._geoserver(loginForm.name.value, loginForm.pwd.value);
    },

    resetPwd: function (event) {
        event.preventDefault();
        let nPwd = document.createElement("input");
        nPwd.id = "newPwd";
        nPwd.classList.add("form-control");
        nPwd.type = "password";
        nPwd.placeholder = "Nueva contraseña";
        nPwd.required = "true";

        if (!loginForm.newPwd) {
            loginForm.insertBefore(nPwd, loginForm.submit);
        }

        if (login.server == undefined) {
            login.server = window.location.origin;
        }

        let resetOptions = {
            name: loginForm.name.value,
            pwd: loginForm.pwd.value,
            host: login.server,
            newPwd: loginForm.newPwd.value
        }, r = resetOptions;
        if (r.name !== "" && r.pwd !== "" && r.newPwd !== "") {
            login._gsResetPwd(resetOptions);
        }
    },

    // _gsResetPwd: function (o) {
    //     let params = `{ "newPassword": "${o.newPwd}" }`,
    //         gsHost = o.host,
    //         gsUrl = gsHost + '/geoserver/rest/security/self/password',
    //         _usr = o.name,
    //         _pwd = o.pwd,
    //         data = {
    //             params: params,
    //             url: gsUrl,
    //             method: 'PUT',
    //             usr: _usr,
    //             pwd: _pwd,
    //             reqHeader: {
    //                 key: 'Content-type',
    //                 val: 'application/json'
    //             }
    //         };
    //     login._ajax(data, (res) => {
    //         console.info(`Server response: ${res.response}, Status: ${res.status}`);
    //         $('#loginModal').modal('hide');
    //     });
    // },


    _geoserver: async function (name, pwd) {
        let usrPwd = `username=${name}&password=${pwd}`;
        let gsUrl = `https://mapas.lasflores.net.ar/geoserver/j_spring_security_check/`;
        let data = {
            url: gsUrl,
            method: 'POST',
            params: usrPwd,
            reqHeader: {
                key: 'Content-type',
                val: 'application/x-www-form-urlencoded'
            }
        };
        const messageError = document.getElementById("notification-error");
        login._ajax(data, (res) => {
            if (res.status === 200) {
                if (res.response.includes("&error=true")) {
                    messageError.classList.remove("hidden");
                    loginForm.name.value = '';
                    loginForm.pwd.value = '';
                } else {
                    const valorCookie = btoa("logged")
                    document.cookie=`user=${valorCookie}`
                    messageError.classList.add("hidden");
                    app.changeProfile("logged");
                    loginForm.name.value = '';
                    loginForm.pwd.value = '';
                    $('#loginModal').modal('hide');
                    document.getElementById("loginBtn").classList.add("hidden");
                    document.getElementById("logoutBtn").classList.remove("hidden");
                }
            }
        });
    },


    logout: function () {
        gsUrl = `https://mapas.lasflores.net.ar/geoserver/j_spring_security_logout`,
            data = {
                params: "",
                url: gsUrl,
                method: 'POST',
                reqHeader: {
                    key: 'Content-type',
                    val: 'application/x-www-form-urlencoded'
                }
            };
            login._ajax(data, (res) => {
                console.info(`Response status ${res.status}`);
                app.changeProfile("default");
                document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            });
            
        document.getElementById("logoutBtn").classList.add("hidden");
        document.getElementById("loginBtn").classList.remove("hidden");
    }

}