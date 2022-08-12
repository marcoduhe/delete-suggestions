const cors_api_url = 'https://marcoduhe.herokuapp.com/';
var accountName = null;
var _status=null; // Allowed values: 'Accepted', 'Denied', 'WaitingReview' , 'Reviewed' or 'Pending'."
var sellerId = null; //colocar el 'Id del seller' o null -> si es null buscará global
/////////////////////////////////
//VARIABLES PARA COLOCAR LIMITE//
var max = null; //Indicar máximo de suggestion a buscar y eliminar -> colocar número o null
var aux_limite=true; //NO CAMBIAR
/////////////////////////////////
var APIKey = null;
var APIToken = null;

var total_result=0;
var DataFiltrada = [];
var _from=1;
var _to=50;
var urlGetSuggestions = null;
var urlDeleteSuggestion=null;
var headers = {};

function start(showLog)
{
    accountName = document.getElementById('account').value;
    _status=document.getElementById('_status').value;
    sellerId=document.getElementById('sellerId').value;
    max = document.getElementById('sellerId').value;
    APIKey = document.getElementById('ApiKey').value;
    APIToken = document.getElementById('ApiToken').value;
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-VTEX-API-AppKey': APIKey,
        'X-VTEX-API-AppToken': APIToken
    };
    console.log('Start to Delete '+_status+' suggestions');
    getSuggestion(DataFiltrada,showLog)
}

function getSuggestion(DataFiltrada,showLog)
{
    urlGetSuggestions = `https://api.vtex.com/${accountName}/suggestions?seller=${sellerId}&status=${_status}&_from=${_from}&_to=${_to}`;
    if(sellerId !== null)
        urlGetSuggestions = `https://api.vtex.com/${accountName}/suggestions?status=${_status}&_from=${_from}&_to=${_to}`;
    fetch(cors_api_url + urlGetSuggestions,{    
        method: 'GET',
        headers: headers,
    }).then(response => response.json())
    .then(result => {
        Array.prototype.push.apply(DataFiltrada,result.Data.map(item => ({
            SellerId: item.SellerId,
            ItemId: item.ItemId
        })));
        if(_from<=1)
        {
            total_result=result.Range.Total;
            //console.group('Total:')
            //document.getElementById(showLog).innerHTML = "Total <br />";
            //console.log(total_result)
            //console.groupEnd()
        }
        //console.group('Response Suggestion')
        if(_to==1||_to%500==0||_to>=total_result)
            //console.log(_to)
        //console.table(DataFiltrada)
        //console.groupEnd()
        if(max)
        {
            aux_limite = (_to<=max)?true:false;
        }
        if(_to<=total_result&&aux_limite)
        {
            _from=_to+1;
            _to=_from+49;
            getSuggestion(DataFiltrada,showLog)
        }else
        {
            //console.log("Total: "+total_result);
            document.getElementById(showLog).innerHTML = "Total: "+total_result+" \r\n";
            //console.log(DataFiltrada);
            document.getElementById(showLog).innerHTML += ("Data: \n\n"+JSON.stringify(DataFiltrada)+" \r\n");
            deleteSuggestion(DataFiltrada,showLog)
            //console.log("----------TERMINO-------")
        }
    })
    .catch(error => console.log('error', error));
}
function deleteSuggestion(Data,showLog)
{
    var contador = 1;
    document.getElementById(showLog).innerHTML += ("Empezar a eliminar: \n\n");
    Data.forEach(element => {
        if(sellerId == null)
                sellerId = element.SellerId;
        urlDeleteSuggestion='https://api.vtex.com/'+accountName+'/suggestions/'+sellerId+'/'+element.ItemId;
        fetch(cors_api_url + urlDeleteSuggestion,{
            method: 'DELETE',
            headers: headers,
        }).then(response => response.text())
        .then(result => {
            //console.group('Delete suggestion')
            //console.log(result)
            if(contador==1||contador%500==0||contador>=total_result)
                document.getElementById(showLog).innerHTML += ("Registro: "+contador+"\r\n");
                //console.log(contador)
            contador=contador+1;
            //console.groupEnd()
        })
        .catch(error => {
        console.log('error', error)
        });   
    });
    document.getElementById(showLog).innerHTML = "----TEMRINÓ---- \r\n";
}
//getSuggestion(DataFiltrada);