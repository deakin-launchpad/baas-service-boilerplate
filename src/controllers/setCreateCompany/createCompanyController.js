import async from "async";
import UniversalFunctions from "../../utils/universalFunctions.js";
const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
import { connectToAlgorand, getBlockchainAccount, deployCompany } from "../../helpers/helperFunctions.js";

const createCompany = (payloadData, callback) => {
	const data = JSON.parse(payloadData.dataFileURL.json);
	console.log(data);
	let algoClient;
	let account;
	let appId;

	const tasks = {
		connectToBlockchain: (cb) => {
			algoClient = connectToAlgorand("", "https://testnet-api.algonode.cloud", 443);
			if (!algoClient) return cb(ERROR.APP_ERROR);
			cb();
		},
		getBlockchainAccount: (cb) => {
			account = getBlockchainAccount();
			if (!account) return cb(ERROR.APP_ERROR);
			cb();
		},
		deployCompany: async (cb) => {
			appId = await deployCompany(algoClient, account);
			if (!appId) return cb(ERROR.APP_ERROR);
			cb();
		},
	};

	async.series(tasks, (err, result) => {
		if (err) return callback(err);
		return callback(null, { result });
	});
};

export default createCompany;