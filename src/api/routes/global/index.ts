import { globalAPIRouter } from "@/api"

export = new globalAPIRouter.Path('/')
	.http('GET', '/', (http) => http
		.onRequest((ctr) => {
			return ctr.print({
				success: true,
				infos: {
					appVersion: ctr["@"].appVersion,
					nodeVersion: process.version.slice(1),
					deployment: process.env.NODE_ENV === 'development' ? 'development' : 'production',
					uptime: Math.floor(process.uptime())
				}
			})
		})
	)