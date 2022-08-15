const cors_api_url = 'https://marcoduhe.herokuapp.com/';
var accountName = null;
var _status="Accepted"; // Allowed values: 'Accepted', 'Denied', 'WaitingReview' , 'Reviewed' or 'Pending'."
var _type="update"; // Allowed values: 'update', 'new'
var sellerId = null; //colocar el 'Id del seller' o null -> si es null buscará global
/////////////////////////////////
//VARIABLES PARA COLOCAR LIMITE//
var max = null; //Indicar máximo de suggestion a buscar y eliminar -> colocar número o null
/////////////////////////////////
var APIKey = null;
var APIToken = null;

var total_result=0;
var total=50;
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
    _type=document.getElementById('_type').value;
    sellerId=document.getElementById('sellerId').value;
    max = document.getElementById('max').value;
    APIKey = document.getElementById('ApiKey').value;
    APIToken = document.getElementById('ApiToken').value;
    _from=1;
    _to=50;
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-VTEX-API-AppKey': APIKey,
        'X-VTEX-API-AppToken': APIToken
    };
    document.getElementById(showLog).innerHTML = ("");
    document.getElementById(showLog).innerHTML += ("Start to Delete "+_status+" suggestions \r\n");
    console.log('Start to Delete '+_status+' suggestions');
    getSuggestion(DataFiltrada,showLog)
}

function getSuggestion(_DataFiltrada,showLog)
{
    if(_to<=total)
    {
        urlGetSuggestions = `https://api.vtex.com/${accountName}/suggestions?status=${_status}&type=${_type}&_from=${_from}&_to=${_to}`;
        if(sellerId !== null && sellerId!=="")
            urlGetSuggestions = `https://api.vtex.com/${accountName}/suggestions?seller=${sellerId}&status=${_status}&type=${_type}&_from=${_from}&_to=${_to}`;
        fetch(cors_api_url + urlGetSuggestions,{    
            method: 'GET',
            headers: headers,
        }).then(response => response.json())
        .then(result => {
            Array.prototype.push.apply(_DataFiltrada,result.Data.map(item => ({
                SellerId: item.SellerId,
                ItemId: item.ItemId
            })));
            if(_from<=1)
            {
                total_result=result.Range.Total;
                document.getElementById(showLog).innerHTML += ("Total registros: "+total_result+" \r\n");
                total=total_result;
                total = (max<total_result)?max:total_result;    
                document.getElementById(showLog).innerHTML += ("Max registros: "+total+" \r\n");
            }
            if(_to<=total)
            {
                if(_to==1||_to%500==0||_to>=total)
                {
                    if(_to!=total)
                        document.getElementById(showLog).innerHTML += ("Registro N°: "+_to+" \r\n");
                    else
                        document.getElementById(showLog).innerHTML += ("Registro N°: "+total+" \r\n");
                }
                _from=_to+1;
                _to=_from+49;
                getSuggestion(_DataFiltrada,showLog)
            }
        })
        .catch(error => console.log('error', error));
    }else
    {
        document.getElementById(showLog).innerHTML += ("Total permitidos: "+total+" \r\n");
        document.getElementById(showLog).innerHTML += ("Data: \n\n"+JSON.stringify(_DataFiltrada)+" \r\n");
        deleteSuggestion(_DataFiltrada,showLog)
    }
}
function deleteSuggestion(Data,showLog)
{
    var contador = 1;
    document.getElementById(showLog).innerHTML += ("\n\nEmpezar a eliminar: \n\n");
    Data.forEach(element => {
        urlDeleteSuggestion='https://api.vtex.com/'+accountName+'/suggestions/'+element.SellerId+'/'+element.ItemId;
        fetch(cors_api_url + urlDeleteSuggestion,{
            method: 'DELETE',
            headers: headers,
        }).then(response => response.text())
        .then(result => {
            if(contador==1||contador%500==0||contador>=total)
                document.getElementById(showLog).innerHTML += ("Registro: "+contador+"\r\n");
            if(contador>=total)
                document.getElementById(showLog).innerHTML += ("----TEMRINÓ---- \r\n");
            contador=contador+1;
        })
        .catch(error => {
        console.log('error', error)
        });   
    });
    
}