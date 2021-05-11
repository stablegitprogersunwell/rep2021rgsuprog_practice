const axios = require('axios')
const sortFunc = require('./functions/sort.js')
const date = new Date()
const moment = require('moment')
const defaultDate = {
  year: date.getFullYear(),
  month: date.getMonth(),
  day: date.getDay(),
}
const DataBaseManager = require('nedb-promises')

class LogManager {
  year;
  month;
  day;
  #logs = [];
  #axios = axios.create({ baseURL: 'http://www.dsdev.tech'})
  constructor(config = defaultDate) {
    this.year = config.year || defaultDate.year
    this.month = config.month || defaultDate.month
    this.day = config.day || defaultDate.day
  }

  async fetchLogs() {
    const {data} = await this.#axios.get('/logs/' + this.assemblyDate())
    this.logs = data.logs
  }

  get logs() {
    return this.#logs
  }
  set logs(v) {
    this.#logs = v
  }
  assemblyDate(split = '') {
    return `${this.year}${split}${this.month}${split}${this.day}`
  }
  sort(type = 'asc') {
    let func = null
    if (type.toLowerCase() === "asc") {
      func = (a, b) => moment(b.created_at).unix() - moment(a.created_at).unix()
    }
    if (type.toLowerCase() === 'desc') {
      func = (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix()
    }
    if (!func) {
      throw new Error('Type can only be ASC or DESC')
    }
    this.#logs = sortFunc(this.logs, func)
    return this.#logs
  }
}



const logManager = new LogManager({year: '2021', month: '01', day: '22'})
logManager.fetchLogs()
  .then(async () => {
    const db = DataBaseManager
      .create(`database/logs-${logManager.assemblyDate('_')}.db`)
    for (const log of logManager.sort()) {
      await db.insert(log)
    }
  })
