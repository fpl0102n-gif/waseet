
import { AppLayout } from "@/components/AppLayout";
import { Section } from "@/components/ui/section";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Heart, Truck, ShoppingBag, Globe, Coins, Shield, UserCog, Mail } from "lucide-react";

const FAQ = () => {
    return (
        <AppLayout>
            <Section id="faq-page" className="bg-gray-50/50">
                <div className="max-w-3xl mx-auto space-y-12">

                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <HelpCircle className="w-8 h-8" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Foire Aux Questions</h1>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto">
                            Des réponses claires pour comprendre le fonctionnement de Waseet, nos services et nos valeurs.
                        </p>
                    </div>

                    {/* A. General */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <Globe className="w-5 h-5" />
                            <h2 className="text-xl font-semibold text-gray-800">Général</h2>
                        </div>
                        <Accordion type="single" collapsible className="w-full bg-white rounded-lg border shadow-sm px-4">
                            <AccordionItem value="general-1">
                                <AccordionTrigger>Qu'est-ce que Waseet ?</AccordionTrigger>
                                <AccordionContent>
                                    Waseet est une plateforme d'intermédiation qui connecte les gens. Nous ne fournissons pas directement les services (comme le transport ou la vente), mais nous coordonnons la mise en relation entre ceux qui ont un besoin et ceux qui peuvent y répondre (vendeurs, livreurs, bénévoles).
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="general-2">
                                <AccordionTrigger>Waseet est-il une entreprise ou une association ?</AccordionTrigger>
                                <AccordionContent>
                                    Waseet est une plateforme hybride. Nous proposons des services commerciaux de courtage (shopping, échange) pour financer notre fonctionnement, tout en gérant bénévolement un volet humanitaire important (Alkhayr, Don de sang).
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* B. Alkhayr (Humanitarian) */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-green-600 mb-2">
                            <Heart className="w-5 h-5" />
                            <h2 className="text-xl font-semibold text-gray-800">Humanitaire (Alkhayr)</h2>
                        </div>
                        <Accordion type="single" collapsible className="w-full bg-white rounded-lg border shadow-sm px-4">
                            <AccordionItem value="alkhayr-1">
                                <AccordionTrigger>Comment fonctionnent les demandes Alkhayr ?</AccordionTrigger>
                                <AccordionContent>
                                    Vous soumettez une demande (médicament, aide). Un administrateur examine sa validité et l'urgence. Si approuvée, elle est publiée anonymement ou transmise à notre réseau de donateurs pour trouver une solution.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="alkhayr-2">
                                <AccordionTrigger>Est-ce que toutes les demandes sont publiées ?</AccordionTrigger>
                                <AccordionContent>
                                    Non. Chaque demande est vérifiée manuellement. Les demandes incomplètes, suspectes ou hors de notre champ d'action peuvent être refusées pour maintenir la crédibilité de la plateforme.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="alkhayr-3">
                                <AccordionTrigger>Puis-je contacter le demandeur directement ?</AccordionTrigger>
                                <AccordionContent>
                                    Pour protéger la vie privée des bénéficiaires, le premier contact passe généralement par Waseet. Nous mettons ensuite les parties en relation de manière sécurisée si nécessaire.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* C. Blood Donation */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-red-600 mb-2">
                            <Heart className="w-5 h-5" />
                            <h2 className="text-xl font-semibold text-gray-800">Don de Sang</h2>
                        </div>
                        <Accordion type="single" collapsible className="w-full bg-white rounded-lg border shadow-sm px-4">
                            <AccordionItem value="blood-1">
                                <AccordionTrigger>Waseet collecte-t-il le sang ?</AccordionTrigger>
                                <AccordionContent>
                                    Absolument pas. Waseet est uniquement un outil de coordination. Nous connectons les demandeurs avec des donneurs potentiels ou des associations. Le prélèvement se fait toujours en structure hospitalière.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="blood-2">
                                <AccordionTrigger>Le don est-il garanti ?</AccordionTrigger>
                                <AccordionContent>
                                    Non. Nous comptons sur la générosité des volontaires inscrits. En cas d'urgence vitale immédiate, contactez toujours directement les hôpitaux ou la protection civile.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* D. Transport */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-blue-600 mb-2">
                            <Truck className="w-5 h-5" />
                            <h2 className="text-xl font-semibold text-gray-800">Transport Bénévole</h2>
                        </div>
                        <Accordion type="single" collapsible className="w-full bg-white rounded-lg border shadow-sm px-4">
                            <AccordionItem value="transport-1">
                                <AccordionTrigger>Qui assure le transport gratuit ?</AccordionTrigger>
                                <AccordionContent>
                                    Ce sont des citoyens bénévoles inscrits sur la plateforme qui proposent leur véhicule pour aider (transport de malades, de dons, etc.). Ce ne sont pas des ambulanciers professionnels.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="transport-2">
                                <AccordionTrigger>Puis-je contacter les transporteurs directement ?</AccordionTrigger>
                                <AccordionContent>
                                    Toute coordination passe par Waseet pour vérifier le besoin et la disponibilité du bénévole, afin d'éviter les abus.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* E. Shopping & Import */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-orange-600 mb-2">
                            <ShoppingBag className="w-5 h-5" />
                            <h2 className="text-xl font-semibold text-gray-800">Shopping & Import</h2>
                        </div>
                        <Accordion type="single" collapsible className="w-full bg-white rounded-lg border shadow-sm px-4">
                            <AccordionItem value="shop-1">
                                <AccordionTrigger>Waseet vend-il des produits ?</AccordionTrigger>
                                <AccordionContent>
                                    Non. Waseet agit comme intermédiaire. Vous nous dites ce que vous voulez (sur des sites étrangers par exemple), et nous coordonnons l'achat et l'importation pour vous via nos partenaires logistiques.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="shop-2">
                                <AccordionTrigger>Les prix sont-ils fixes ?</AccordionTrigger>
                                <AccordionContent>
                                    Les devis sont des estimations basées sur le prix du produit + frais de service + transport. Le prix final peut varier légèrement selon le taux de change ou les frais de douane réels.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* F. Exchange */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-yellow-600 mb-2">
                            <Coins className="w-5 h-5" />
                            <h2 className="text-xl font-semibold text-gray-800">Change (Devises)</h2>
                        </div>
                        <Accordion type="single" collapsible className="w-full bg-white rounded-lg border shadow-sm px-4">
                            <AccordionItem value="exchange-1">
                                <AccordionTrigger>Êtes-vous une banque ?</AccordionTrigger>
                                <AccordionContent>
                                    Non. Waseet est un courtier qui met en relation des particuliers ou professionnels pour faciliter les échanges, en offrant un cadre de confiance (tiers de confiance).
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="exchange-2">
                                <AccordionTrigger>Les taux sont-ils garantis ?</AccordionTrigger>
                                <AccordionContent>
                                    Les taux affichés sont indicatifs (marché parallèle). Le taux réel est confirmé au moment de la validation de la transaction avec l'intermédiaire.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* G. Privacy & Admin */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-purple-600 mb-2">
                            <Shield className="w-5 h-5" />
                            <h2 className="text-xl font-semibold text-gray-800">Confidentialité & Modération</h2>
                        </div>
                        <Accordion type="single" collapsible className="w-full bg-white rounded-lg border shadow-sm px-4">
                            <AccordionItem value="privacy-1">
                                <AccordionTrigger>Mon numéro est-il visible par tous ?</AccordionTrigger>
                                <AccordionContent>
                                    Non. Par défaut, votre numéro n'est visible que par les administrateurs. Si une mise en relation est nécessaire (ex: donateur vers receveur), nous vous demandons votre accord ou nous transmettons l'info de manière sécurisée.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="privacy-2">
                                <AccordionTrigger>Pourquoi un admin a modifié ma demande ?</AccordionTrigger>
                                <AccordionContent>
                                    Les administrateurs peuvent reformuler une demande pour la rendre plus claire, plus respectueuse, ou pour masquer des détails trop personnels avant la publication. C'est pour votre sécurité.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* Contact Footer */}
                    <div className="border-t pt-8 mt-8 text-center bg-white p-8 rounded-lg shadow-sm">
                        <div className="flex justify-center mb-4 text-primary">
                            <Mail className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">D'autres questions ?</h3>
                        <p className="text-gray-600 mb-6 mt-2">
                            Notre équipe est là pour vous répondre directement.
                        </p>
                        <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">
                            Nous Contacter
                        </a>
                    </div>

                </div>
            </Section>
        </AppLayout>
    );
};

export default FAQ;
