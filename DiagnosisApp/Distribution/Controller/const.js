/**************************************************************/
// webView id 
var IndexId = 'index.html';
var indexSubContentId = 'indexSubContent';
var indexContentId = 'indexContent';
var TriageId = 'triage';
var SettingId = 'setting';
var ReservationId = 'reservation';
var ReferralId = 'referral';
var StatisticsId = 'statistics';
var DiagnosisDetailsId = 'diagnosisDetails';
var reservationDetailsId = 'reservationDetails';
var ReturnCase = 'returnCase';

// sub webView id
var TriageListId = 'triageList';
var ReservationListId = 'reservationList';
var ReferralListId = 'referralList';

/**************************************************************/
// 分模块标志位

// 分诊
var NOT_TRIAGE = 'notTriage'; // 待分诊
var TRIAGE = 'triage'; // 已分诊
var BACK_TRIAGE = 'backTriage'; // 退回分诊	
var MULTI_EXPERT = 'multiExpert'; // 分诊-多专家
var RECYCLE = 'recycle'; // 讨论
var RESERVATION = 'reservation'; // 预约
var REFERRAL = 'referral'; // 转诊
var SETTING = 'setting'; // 设置
// 预约
var NOT_RESERVATION = 'notReservation'; // 未预约
var RESERVATION = 'reservation'; // 已预约
var BACK_RESERVATION = 'backReservation'; // 退回预约
// 转诊
var NOT_REFERRAL = 'notReferral'; // 待分诊转诊
var TRIAGE_REFERRAL = 'referral'; // 已分诊转诊
var REFERRAL = 'referral'; // 已转诊
var BACK_REFERRAL = 'referral'; //退回转诊
// 统计
var STATISTICS = 'statistics' // 统计


/**************************************************************/
// List Toolbar Title

// 分诊
var TRIAGE_NOSTATUS_TITLE = '分诊列表';
var NOT_TRIAGE_TITLE = '待分诊'; // 待分诊
var TRIAGE_TITLE = '已分诊'; // 已分诊
var BACK_TRIAGE_TITLE = '退回分诊'; // 退回分诊	
var MULTI_EXPERT_TITLE = '多专家'; // 分诊-多专家
var RECYCLE_TITLE = '回收'; // 讨论
var RESERVATION_TITLE = '预约'; // 预约
var REFERRAL_TITLE = '转诊'; // 转诊
var SETTING_TITLE = '设置'; // 设置
// 预约
var RESERVATION_NOSTATUS_TITLE = '预约列表';
var NOT_RESERVATION_TITLE = '未预约'; // 未预约
var RESERVATION_TITLE = '已预约'; // 已预约
var BACK_RESERVATION_TITLE = '退回预约'; // 退回预约
// 转诊
var REFERRAL_NOSTATUS_TITLE = '转诊列表'; 
var NOT_REFERRAL_TITLE = '待分诊'; // 待分诊转诊
var TRIAGE_REFERRAL_TITLE = '已分诊'; // 已分诊转诊
var REFERRAL_TITLE = '已转诊'; // 已转诊
var BACK_REFERRAL_TITLE = '退回转诊'; //退回转诊
// 统计
var STATISTICS_TITLE = '统计'; // 统计


/**************************************************************/
// Toolbar Title for details

var TRIAGE_NOSTATUS_TITLE_DETAILS = '详情';
// 分诊
var NOT_TRIAGE_TITLE_DETAILS = '待分诊'; // 待分诊
var TRIAGE_TITLE_DETAILS= '已分诊'; // 已分诊
var BACK_TRIAGE_TITLE_DETAILS = '退回分诊'; // 退回分诊	
var MULTI_EXPERT_TITLE_DETAILS = '多专家'; // 分诊-多专家
var RECYCLE_TITLE_DETAILS = '回收'; // 讨论
var RESERVATION_TITLE_DETAILS = '预约'; // 预约
var REFERRAL_TITLE_DETAILS = '转诊'; // 转诊
// 转诊
var NOT_REFERRAL_TITLE_DETAILS = '待分诊'; // 待分诊转诊
var TRIAGE_REFERRAL_TITLE_DETAILS = '已分诊'; // 已分诊转诊
var REFERRAL_TITLE_DETAILS = '已转诊'; // 已转诊
var BACK_REFERRAL_TITLE_DETAILS = '退回转诊'; //退回转诊
