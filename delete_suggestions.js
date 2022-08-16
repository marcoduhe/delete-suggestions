const cors_api_url = 'https://marcoduhe.herokuapp.com/';
var accountName = null;
var _status = "Accepted"; // Allowed values: 'Accepted', 'Denied', 'WaitingReview' , 'Reviewed' or 'Pending'."
var _type = "update"; // Allowed values: 'update', 'new'
var sellerId = null; //colocar el 'Id del seller' o null -> si es null buscará global
/////////////////////////////////
//VARIABLES PARA COLOCAR LIMITE//
var max = null; //Indicar máximo de suggestion a buscar y eliminar -> colocar número o null
/////////////////////////////////
var APIKey = null;
var APIToken = null;

var total_result = 0;
var total = 50;
var DataFiltrada = [];
var _from = 1;
var _to = 50;
var sumar = 49;
var urlGetSuggestions = null;
var urlDeleteSuggestion = null;
var headers = {};

function start(showLog) {
    console.clear()
    accountName = document.getElementById('account').value;
    _status = document.getElementById('_status').value;
    _type = document.getElementById('_type').value;
    sellerId = document.getElementById('sellerId').value;
    max = document.getElementById('max').value;
    APIKey = document.getElementById('ApiKey').value;
    APIToken = document.getElementById('ApiToken').value;
    _from = 1;
    _to = 50;
    if (max <= _to && (max != null && max != ""))
        _to = max;
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-VTEX-API-AppKey': APIKey,
        'X-VTEX-API-AppToken': APIToken
    };
    document.getElementById(showLog).innerHTML = ("");
    document.getElementById("output2").innerHTML = ("");
    document.getElementById("output3").innerHTML = ("");
    document.getElementById(showLog).innerHTML += ("Start to Delete " + _status + " suggestions \r\n");
    console.log('Start to Delete ' + _status + ' suggestions');
    getSuggestion(DataFiltrada, showLog)
}

function getSuggestion(_DataFiltrada, showLog) {
    if (_from == 1) {
        urlGetSuggestions = `https://api.vtex.com/${accountName}/suggestions?status=${_status}&type=${_type}&_from=1&_to=2`;
        if (sellerId !== null && sellerId !== "")
            urlGetSuggestions = `https://api.vtex.com/${accountName}/suggestions?seller=${sellerId}&status=${_status}&type=${_type}&_from=1&_to=2`;
        fetch(cors_api_url + urlGetSuggestions, {
            method: 'GET',
            headers: headers,
        }).then(response => response.json())
            .then(result => {
                total = result.Range.Total;
                if (_to >= total)
                    _to = total;
            })
    }
    if (_to <= total && _from <= total) {
        urlGetSuggestions = `https://api.vtex.com/${accountName}/suggestions?status=${_status}&type=${_type}&_from=${_from}&_to=${_to}`;
        if (sellerId !== null && sellerId !== "")
            urlGetSuggestions = `https://api.vtex.com/${accountName}/suggestions?seller=${sellerId}&status=${_status}&type=${_type}&_from=${_from}&_to=${_to}`;
        fetch(cors_api_url + urlGetSuggestions, {
            method: 'GET',
            headers: headers,
        }).then(response => response.json())
            .then(result => {
                Array.prototype.push.apply(_DataFiltrada, result.Data.map(item => ({
                    SellerId: item.SellerId,
                    ItemId: item.ItemId
                })));
                if (_from <= 1) {
                    total_result = result.Range.Total;
                    document.getElementById(showLog).innerHTML += ("Total registros: " + total_result + " \r\n");
                    total = total_result;
                    if (max != null && max != "")
                        total = (max < total_result) ? max : total_result;
                    document.getElementById(showLog).innerHTML += ("Max registros: " + total + " \r\n");
                }
                if (_from == 1 || _to % 500 == 0) {
                    document.getElementById(showLog).innerHTML += ("Registro N°: " + _to + " \r\n");
                } else if (_to == total) {
                    document.getElementById(showLog).innerHTML += ("Registro N°: " + total + " \r\n");
                }
                if ((total - _to) < sumar)
                    sumar = (total - _to) - 1;
                _from = _to + 1;
                _to = _from + sumar;
                getSuggestion(_DataFiltrada, showLog)
            })
            .catch(error => console.log('error', error));
    } else {
        var DataDelete = [];
        const getUniqueItemsByProperties = (items, propNames) => {
            const propNamesArray = Array.from(propNames);

            return items.filter((item, index, array) =>
                index === array.findIndex(foundItem => isPropValuesEqual(foundItem, item, propNamesArray))
            );
        };
        DataDelete = getUniqueItemsByProperties(_DataFiltrada,['SellerId','ItemId']);
        document.getElementById(showLog).innerHTML += ("Total permitidos: " + total + " \r\n");
        document.getElementById("output2").innerHTML += ("Data: \n\n" + JSON.stringify(DataDelete) + " \r\n");
        deleteSuggestion(_DataFiltrada, "output3")
    }
}
function deleteSuggestion(_Data, showLog) {
    document.getElementById(showLog).innerHTML += ("Empezar a eliminar: \n\n");
    var DataDelete =[];
    total = _Data.length;
    function fetchAll() {
        for (var i = 0; i < total; i++) {
            urlDeleteSuggestion = fetch(`${cors_api_url}https://api.vtex.com/${accountName}/suggestions/${_Data[i].SellerId}/${_Data[i].ItemId}`, {
                method: 'DELETE',
                headers: headers,
            });
            DataDelete.push(urlDeleteSuggestion);
        }
        return Promise.all(DataDelete);
    }
    const awaitJson = Promise.all(DataDelete.map(response => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
    }));
    document.getElementById(showLog).innerHTML += ("1.- Procesando fetch \n");
    fetchAll()
        .then(awaitJson)
        .then(result => {
            document.getElementById(showLog).innerHTML += ("2.- Listado de skus eliminados:\n\n");
            result.forEach(response => {
                if (response.status != 500)
                    document.getElementById(showLog).innerHTML += (String(response.url).substr(73, 100) + "\n");
                else
                    document.getElementById(showLog).innerHTML += ("No se eliminó: " + String(response.url).substr(73, 100) + "\n");
            })
            console.log(result);
            document.getElementById(showLog).innerHTML += ("----TEMRINÓ---- \r\n");
        })
        .catch(error => {
            console.log('Error Promise: ', error)
        });
}