// 请求服务器host
import { Base64 } from 'js-base64';
const host = 'https://staging.handy.travel';
// const host = 'https://www.lansheng8.com'

// webview 获取当前 handy 设备信息
let handyInfo = {},
    ticketInfo = {}

// 是否在安卓环境
if (window.Global) {
  console.log('from native')
  handyInfo = JSON.parse(window.Global.getGlobalProperties())
  ticketInfo = JSON.parse(window.Ticketing.getTicketingProperties())
} else {
  console.log('from web')
  handyInfo = JSON.parse('{"service_counter":"HKG - QA ECOM","coordinate_system":"wgs84","location_accuracy":22.535,"longitude":114.1927434,"hotel_id":"5652","rom_version":"7.6.0-c70600-b6215-04514f0c8-181021224350-qa","handy_country_code":"852","device_locale":"en_US","imei":"356112071058161","status":"rented_out","handy_zone":"Hong Kong","latitude":22.2869474,"room_id":"Test005","application_id":"com.tinklabs.handy.ticketing","deploy_environment":"staging","handy_country":"Hong Kong","user_language":"English","device_user_id":"29243505","timestamp_utc":1545037964254}')

  ticketInfo = JSON.parse('{"token":"b5b5b7c255b6981112c4c13989baed3b","version":"2.2.0"}')
}

// 根据 SDK 信息生成凭证
const token = JSON.stringify({
  "barcode": handyInfo.imei,
  "key": ticketInfo.token,
})
const auth = Base64.encode(token)

/**
 * 发送网络请求
 * @param method            HTTP 请求方法
 * @param url               URL
 * @param bodyParams        HTTP Body
 * @param urlParams         URL Params
 */
export default async function (method, url, { bodyParams = {}, urlParams = {} }) {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', auth);
  headers.append('X-Handy-locale', handyInfo.device_locale);
  headers.append('Handy-Deal-Version', ticketInfo.version || '2.0.0');

  // 将url参数写入URL
  let urlParStr = '';
  const urlParArr = Object.keys(urlParams);
  if (urlParArr.length) {
    Object.keys(urlParams).forEach((element) => {
      urlParStr += `${element}=${urlParams[element]}&`;
    });
    urlParStr = `?${urlParStr}`.slice(0, -1);
  }

  const res = await fetch(new Request(`${host}${url}${urlParStr}`, {
    method,
    headers,
    body: method === ('GET' || 'HEAD') ? null : JSON.stringify(bodyParams),
  }));

  if ((res.status < 200 || res.status > 299) && res.status !== 304) {
    console.log(`出错啦：${res.status}`);
  } else {
    return res.json();
  }
}
