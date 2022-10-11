import { useRouter } from 'next/router'
import { useQueryClient } from '@tanstack/react-query'
import { useAccount, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { chainConfig, LOCAL_STORAGE_KEY } from '~/lib/constants'
import { useGetOracle } from './useGetOracle'
import { txError, txSuccess } from '~/components/TxToast'
import { useTxContext } from '~/contexts'

interface IUseBorrowProps {
	poolAddress: string
	cartTokenIds: Array<number>
	maxInterest?: number
	totalReceived: string
	enabled: boolean
}

export function useBorrow({ poolAddress, cartTokenIds, maxInterest, totalReceived, enabled }: IUseBorrowProps) {
	const { data: oracle, isLoading: fetchingOracle, isError: errorFetchingOracle } = useGetOracle(poolAddress)
	const router = useRouter()

	const { cart, ...queries } = router.query

	const queryClient = useQueryClient()

	const { address: userAddress } = useAccount()
	const { chain } = useNetwork()

	const config = chainConfig(chain?.id)

	const txContext = useTxContext()

	const { config: contractConfig } = usePrepareContractWrite({
		addressOrName: poolAddress,
		contractInterface: config.poolABI,
		functionName: 'borrow',
		args: [
			[...cartTokenIds],
			(oracle?.price ?? 0).toFixed(0),
			oracle?.deadline,
			maxInterest,
			totalReceived,
			oracle?.signature?.v,
			oracle?.signature?.r,
			oracle?.signature?.s
		],
		enabled: enabled || (oracle?.price ? true : false)
	})

	const contractWrite = useContractWrite({
		...contractConfig,
		onSuccess: (data) => {
			txContext.hash!.current = data.hash
			txContext.dialog?.toggle()
		}
	})

	const waitForTransaction = useWaitForTransaction({
		hash: contractWrite.data?.hash,
		onSettled: (data) => {
			if (data?.status === 1) {
				const totalReceived = contractWrite.variables?.args?.[4]

				txSuccess({
					txHash: contractWrite.data?.hash ?? '',
					blockExplorer: config.blockExplorer,
					content: <span>{`Borrow ${totalReceived / 1e18} ETH`}</span>
				})

				// clear items in cart if tx is successfull
				const prevItems = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}')

				if (userAddress) {
					if (prevItems) {
						const items = prevItems[userAddress]

						localStorage.setItem(
							LOCAL_STORAGE_KEY,
							JSON.stringify({
								...items,
								[userAddress]: {
									[poolAddress]: []
								}
							})
						)
					} else {
						localStorage.setItem(
							LOCAL_STORAGE_KEY,
							JSON.stringify({
								[userAddress]: {
									[poolAddress]: []
								}
							})
						)
					}
				}

				router.push({ pathname: router.pathname, query: { ...queries } })
			} else {
				txError({ txHash: contractWrite.data?.hash ?? '', blockExplorer: config.blockExplorer })
			}

			queryClient.invalidateQueries()
		}
	})

	return {
		...contractWrite,
		waitForTransaction,
		mutationDisabled: fetchingOracle || errorFetchingOracle
	}
}
