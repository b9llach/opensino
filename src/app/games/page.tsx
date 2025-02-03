import Image from "next/image"
import Link from "next/link"

const games = [
    {
        name: "MINES",
        image: "https://mediumrare.imgix.net/15a51a2ae2895872ae2b600fa6fe8d7f8d32c9814766b66ddea2b288d04ba89c?w=360&h=472&fit=min&auto=format",
        href: "/games/mines",
        players: "552",
        label: "STAKE ORIGINALS"
      },
  {
    name: "PLINKO",
    image: "https://mediumrare.imgix.net/5cbb2498c956527e6584c6af216489b85bbb7a909c7d3c4e131a3be9bd1cc6bf?w=360&h=472&fit=min&auto=format",
    href: "/games/plinko",
    players: "1,060",
    label: "STAKE ORIGINALS"
  },
  {
    name: "BLACKJACK",
    image: "https://mediumrare.imgix.net/5fcbd552a53b9be85428ecd7fa0ef663f9d763bd8a504dd0de222bc873b79887?w=360&h=472&fit=min&auto=format",
    href: "/games/blackjack",
    players: "725",
    label: "STAKE ORIGINALS"
  },
//   {
//     name: "PUMP",
//     image: "https://mediumrare.imgix.net/bfd2cbc0217a6350c164511ecc4a0d965b94f9e648536cab32c89e50a3c6204a?w=360&h=472&fit=min&auto=format",
//     href: "/games/pump",
//     players: "372",
//     label: "STAKE ORIGINALS"
//   },
//   {
//     name: "DICE",
//     image: "https://mediumrare.imgix.net/30688668d7d2d48d472edd0f1e2bca0758e7ec51cbab8c04d8b7f157848640e0?w=360&h=472&fit=min&auto=format",
//     href: "/games/dice",
//     players: "597",
//     label: "STAKE ORIGINALS"
//   },
//   {
//     name: "CRASH",
//     image: "https://mediumrare.imgix.net/c830595cbd07b2561ac76a365c2f01869dec9a8fe5e7be30634d78c51b2cc91e?w=360&h=472&fit=min&auto=format",
//     href: "/games/crash",
//     players: "297",
//     label: "STAKE ORIGINALS"
//   },
];

export default function GamesPage() {
  return (
    <div className="container mx-auto px-4">
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {games.map((game) => (
          <Link key={game.name} href={game.href}>
            <div className="flex flex-col">
              <div className="relative group">
                <Image
                  src={game.image}
                  alt={game.name}
                  width={160}
                  height={210}
                  className="rounded-lg transition-transform duration-200 group-hover:scale-105 w-full"
                />
              </div>
              <div className="mt-2">
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="text-zinc-600 text-sm mt-4">
        Displaying {games.length} of {games.length} games
      </div>
    </div>
  )
}

