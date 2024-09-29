export type PaystackPaymentResp = {
	status: boolean
	message: string
	data: {
		authorization_url: string
		access_code: string
		reference: string
	}
}

export type TransactionConfirmationResponse = {
	event: string
	data: {
		id: number
		domain: string
		status: string
		reference: string
		amount: number
		message: any
		gateway_response: string
		paid_at: string
		created_at: string
		channel: string
		currency: string
		ip_address: string
		metadata: any
		log: {
			time_spent: number
			attempts: number
			authentication: string
			errors: number
			success: boolean
			mobile: boolean
			input: Array<any>
			channel: any
			history: Array<{
				type: string
				message: string
				time: number
			}>
		}
		fees: any
		customer: {
			id: number
			first_name: string
			last_name: string
			email: string
			customer_code: string
			phone: any
			metadata: any
			risk_action: string
		}
		authorization: {
			authorization_code: string
			bin: string
			last4: string
			exp_month: string
			exp_year: string
			card_type: string
			bank: string
			country_code: string
			brand: string
			account_name: string
		}
		plan: {}
	}
}

