import Crontab from "@/crontab"
import logger from "@/globals/logger"

export default new Crontab()
	.cron('* * * * *')
	.listen(async(ctx) => {
		/*logger()
			.text('Running Check Demo Accesses Schedule')
			.info()

		console.log('e')*/
	})