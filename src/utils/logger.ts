// import dayjs from 'dayjs'
import logger from 'pino'

export const log = logger({
	base: {
		pid: false,
	},
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
		},
	},
	// timestamp: () => `,"time":"${dayjs().format()}"`,
})
