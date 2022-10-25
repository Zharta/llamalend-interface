import { ContractInterface, providers, Signer } from 'ethers'

export type Provider = providers.BaseProvider

export interface ITransactionSuccess {
	hash: string
	wait: () => Promise<{
		status?: number | undefined
	}>
}

export interface ITransactionError {
	message: string
}

export interface IContractReadConfig {
	address: string
	abi: ContractInterface
	provider: Provider
}

export interface IContractWriteConfig {
	address: string
	abi: ContractInterface
	signer: Signer | null
}

export interface INftApiResponse {
	ownedNfts: {
		id: {
			tokenId: string
		}
		metadata: {
			image: string
		}
		media: { gateway: string }[]
	}[]
}

export interface INftItem {
	tokenId: number
	imgUrl: string
}

export interface IOracleResponse {
	deadline: number
	normalizedNftContract: string
	price: number
	signature: {
		r: string
		s: string
		v: number
	}
}

export interface IBorrowPool {
	name: string
	symbol: string
	address: string
	maxLoanLength: number
	ltv: number
	currentAnnualInterest: number
	maxNftsToBorrow: number
	nftContract: string
	adminPoolInfo: {
		key: string
		nftName: string
		poolBalance: number
		maxPrice: number
		maxDailyBorrows: number
		maxLoanLength: number
		oracle: string
		minimumInterest: string
		maximumInterest: string
		liquidators: Array<string>
	}
}

export interface IBorrowPoolData {
	name: string
	symbol: string
	maxLoanLength: number
	currentAnnualInterest: number
	maxVariableInterestPerEthPerSecond: number
	ltv: number
	nftContract: string
	nftName: string
	owner: string
	maxNftsToBorrow: number
}

export interface IGetAdminPoolDataArgs {
	poolAddress: string
	nftContractAddress: string
	poolAbi: ContractInterface
	provider: Provider
	graphEndpoint: string
}

export interface ILoan {
	id: string
	loanId: number | string
	nftId: string
	interest: string
	startTime: string
	borrowed: string
	toPay: number
	deadline: number
	imgUrl: string
	owner: string
	pool: {
		name: string
		owner: string
		address: string
	}
}

export interface ILoanValidity {
	poolAddress: string
	loanId: number | string
	provider: Provider
	poolABI: ContractInterface
}
