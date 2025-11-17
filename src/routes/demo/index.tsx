import { createFileRoute } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/query-core"
import { createCollection, ilike, useLiveQuery } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { z } from 'zod'

const queryClient = new QueryClient()

const dogBreedSchema = z.object({
    id: z.string(),
    type: z.string(),
    attributes: z.object({
        name: z.string(),
    }),
})

const dogBreedsCollection = createCollection(
    queryCollectionOptions({
        schema: dogBreedSchema,
        queryKey: ['dogBreeds'],
        queryFn: async () => {
            const response = await fetch('https://dogapi.dog/api/v2/breeds')
            const { data } = await response.json();
            return data;
        },
        queryClient,
        getKey: (item) => item.id,
    })
)

export const Route = createFileRoute('/demo/')({
  component: Demo,
})

function Demo() {
    const { data } = useLiveQuery(q => 
        q.from({ dogBreed: dogBreedsCollection }).where(({ dogBreed }) => ilike(dogBreed.attributes.name, '%american%'))
    )
    
    if (!data) {
        return <div>Loading...</div>
    }

    return <div>
        {data.map(breed => <div key={breed.id}>{breed.attributes.name}</div>)}
    </div>
}