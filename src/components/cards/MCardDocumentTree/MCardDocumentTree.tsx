import type {MCardDocumentTreeProps} from './MCardDocumentTree.types'
import {MCard, MCardBody, MCardHeader} from '../MCard'
import {MButton} from '../../controls'
import {MTreeView} from '../../data'
import {MDetailList} from '../../display'
import {MGrid, MInline, MStack} from '../../layout'
import {MDropdownItem, MDropdownMenu} from '../../overlays'
import {MHeading, MText} from '../../typography'
import {MEllipsisVerticalIcon} from '../../../icons'
import {tintCardChildren} from '../shared'
import type {MTreeNode} from '../../data/MTreeView'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

export function MCardDocumentTree({
    title = 'Documents',
    description,
    color = 'primary',
    items,
    selected,
    onSelect,
    defaultExpanded,
    expanded,
    onExpandChange,
    detailsTitle,
    detailsMeta,
    detailsItems = [],
    detailsActions = [],
    renderDetails,
    emptyDetails = <MText tone={'muted'}>Select a document to inspect its details.</MText>,
    primaryAction,
    ...rest
}: MCardDocumentTreeProps) {
    const texts = useMCommonTexts()
    const mapNode = (node: MTreeNode): MTreeNode => {
        return {
            ...node,
            icon: tintCardChildren(node.icon, color),
            children: node.children?.map(mapNode),
        }
    }
    const itemsWithTint = items.map(mapNode)

    return (
        <MCard stretch={false} color={color} {...rest}>
            <MCardHeader>
                <MInline justify={'between'} align={'center'}>
                    <MStack>
                        <MHeading level={4}>{title}</MHeading>
                        {description && (
                            <MText size={'sm'} tone={'muted'}>
                                {description}
                            </MText>
                        )}
                    </MStack>
                    {tintCardChildren(primaryAction, color)}
                </MInline>
            </MCardHeader>
            <MCardBody>
                <MGrid type={'row'} align={'start'}>
                    <MGrid type={'col'} xl={7} sm={12}>
                        <MTreeView
                            items={itemsWithTint}
                            color={color}
                            defaultExpanded={defaultExpanded}
                            expanded={expanded}
                            onExpandChange={onExpandChange}
                            selected={selected}
                            onSelect={onSelect}
                            expandable
                            selectable
                            showLines
                            fileIcons
                        />
                    </MGrid>
                    <MGrid type={'col'} xl={5} sm={12}>
                        <MStack padding={'sm'}>
                            {(detailsTitle || detailsMeta || detailsActions.length > 0) && (
                                <MInline justify={'between'} align={'start'}>
                                    <MStack>
                                        {detailsTitle && <MHeading level={5}>{detailsTitle}</MHeading>}
                                        {detailsMeta && (
                                            <MText size={'sm'} tone={'muted'}>
                                                {detailsMeta}
                                            </MText>
                                        )}
                                    </MStack>

                                    {detailsActions.length > 0 && (
                                        <MDropdownMenu
                                            placement={'bottom-end'}
                                            trigger={
                                                <MButton
                                                    variant={'ghost'}
                                                    color={color}
                                                    iconOnly
                                                    shape={'circle'}
                                                    aria-label={texts.documentActions}
                                                >
                                                    <MEllipsisVerticalIcon />
                                                </MButton>
                                            }
                                        >
                                            {detailsActions.map((action) => (
                                                <MDropdownItem
                                                    key={action.id}
                                                    icon={tintCardChildren(action.icon, action.color ?? color)}
                                                    label={action.label}
                                                    color={action.color ?? color}
                                                    disabled={action.disabled}
                                                    component={action.component}
                                                    href={action.href}
                                                    to={action.to}
                                                    onClick={action.onClick}
                                                />
                                            ))}
                                        </MDropdownMenu>
                                    )}
                                </MInline>
                            )}

                            {renderDetails ? (
                                renderDetails
                            ) : detailsItems.length ? (
                                <MDetailList items={detailsItems} />
                            ) : (
                                emptyDetails
                            )}
                        </MStack>
                    </MGrid>
                </MGrid>
            </MCardBody>
        </MCard>
    )
}
