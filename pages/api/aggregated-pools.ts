import type { NextApiRequest, NextApiResponse } from 'next'
import { getDataArcade } from '~/AggregatorAdapters/arcade'
import { getDataBendDao } from '~/AggregatorAdapters/benddao'
import { getDataJpegd } from '~/AggregatorAdapters/jpegd'
import { getDataNftFi } from '~/AggregatorAdapters/nftfi'
import { getDataX2y2 } from '~/AggregatorAdapters/x2y2'
import { getDataParaspace } from '~/AggregatorAdapters/paraspace'
import { getDataCyan } from '~/AggregatorAdapters/cyan'
import { getDataZharta } from '~/AggregatorAdapters/zharta'

export default async function getAggregatedPools(req: NextApiRequest, res: NextApiResponse) {
	const { collectionAddress } = req.query

	try {
		if (!collectionAddress) throw new Error('Missing Collection Address')

		if (typeof collectionAddress !== 'string') throw new Error('Invalid Collection Address')

		const [x2y2, jpegd, nftfi, arcade, bendDao, paraspace, cyan, zharta] = await Promise.allSettled([
			getDataX2y2(collectionAddress),
			getDataJpegd(collectionAddress),
			getDataNftFi(collectionAddress),
			getDataArcade(collectionAddress),
			getDataBendDao(collectionAddress),
			getDataParaspace(collectionAddress),
			getDataCyan(collectionAddress),
			getDataZharta(collectionAddress)
		])

		res.status(200).json({
			pools: {
				x2y2: x2y2.status === 'fulfilled' ? x2y2.value : [],
				nftfi: nftfi.status === 'fulfilled' ? nftfi.value : [],
				arcade: arcade.status === 'fulfilled' ? arcade.value : [],
				bendDao: bendDao.status === 'fulfilled' ? bendDao.value : [],
				jpegd: jpegd.status === 'fulfilled' ? jpegd.value : [],
				paraspace: paraspace.status === 'fulfilled' ? paraspace.value : [],
				cyan: cyan.status === 'fulfilled' ? cyan.value : [],
				zharta: zharta.status === 'fulfilled' ? zharta.value : []
			}
		})
	} catch (error: any) {
		console.error(error)

		res.status(400)
	}
}
